import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class GymSlotApiStack extends cdk.Stack {
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const gymsTable = new dynamodb.Table(this, 'GymsTable', {
      tableName: 'gymslot-gyms',
      partitionKey: { name: 'gymId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const bookingsTable = new dynamodb.Table(this, 'BookingsTable', {
      tableName: 'gymslot-bookings',
      partitionKey: { name: 'bookingId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    bookingsTable.addGlobalSecondaryIndex({
      indexName: 'gym-slot-index',
      partitionKey: { name: 'gymId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'slotTime', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    });

    bookingsTable.addGlobalSecondaryIndex({
      indexName: 'user-slot-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'slotTime', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    });

    const apiHandler = new NodejsFunction(this, 'GymSlotApiHandler', {
      functionName: 'gymslot-api',
      entry: path.join(__dirname, '../../backend/lambda/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(29),
      reservedConcurrentExecutions: 100,
      environment: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'warn',
        GYMS_TABLE_NAME: gymsTable.tableName,
        BOOKINGS_TABLE_NAME: bookingsTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: ['@aws-sdk/*'],
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    gymsTable.grantReadWriteData(apiHandler);
    bookingsTable.grantReadWriteData(apiHandler);

    apiHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'dynamodb:GetItem',
          'dynamodb:UpdateItem',
          'dynamodb:PutItem',
          'dynamodb:Query',
        ],
        resources: [
          gymsTable.tableArn,
          bookingsTable.tableArn,
          `${bookingsTable.tableArn}/index/*`,
        ],
      }),
    );

    const api = new apigw.RestApi(this, 'GymSlotApi', {
      restApiName: 'GymSlot API',
      description: 'Real-time gym capacity and booking API',
      deployOptions: {
        stageName: 'v1',
        throttlingBurstLimit: 200,
        throttlingRateLimit: 100,
        metricsEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.ERROR,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const lambdaIntegration = new apigw.LambdaIntegration(apiHandler, {
      proxy: true,
    });

    const gyms = api.root.addResource('gyms');
    const gym = gyms.addResource('{id}');
    const capacity = gym.addResource('capacity');
    capacity.addMethod('GET', lambdaIntegration);
    const book = gym.addResource('book');
    book.addMethod('POST', lambdaIntegration);

    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Base URL for the GymSlot API',
      exportName: 'GymSlotApiUrl',
    });

    new cdk.CfnOutput(this, 'GymsTableArn', {
      value: gymsTable.tableArn,
      exportName: 'GymSlotGymsTableArn',
    });

    cdk.Tags.of(this).add('Project', 'GymSlot');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}