import awsLambdaFastify from '@fastify/aws-lambda';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { buildApp } from '../src/app.js';

let proxy: ReturnType<typeof awsLambdaFastify> | undefined;

async function getProxy() {
  if (!proxy) {
    const app = await buildApp();
    proxy = awsLambdaFastify(app);
  }
  return proxy;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const p = await getProxy();
  return p(event, context);
};