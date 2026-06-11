import * as cdk from 'aws-cdk-lib';
import { GymSlotApiStack } from './lib/gymslot-stack';

const app = new cdk.App();

new GymSlotApiStack(app, 'GymSlotApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'GymSlot real-time gym capacity and booking API',
});

app.synth();