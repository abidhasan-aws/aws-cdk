import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cr from 'aws-cdk-lib/custom-resources';

/*
 * The custom resource invokes a Lambda function with only the permissions that
 * `AwsCustomResourcePolicy.fromSdkCalls` generates. The deployment succeeds only
 * when `InvokeCommand` maps to `lambda:InvokeFunction`.
 */

const app = new cdk.App({
  postCliContext: {
    '@aws-cdk/aws-lambda:useCdkManagedLogGroup': false,
  },
});

const stack = new cdk.Stack(app, 'AwsCustomResourceLambdaInvokeStack');

const fn = new lambda.Function(stack, 'Function', {
  code: lambda.Code.fromInline("exports.handler = async () => { return 'Hello World'; };"),
  handler: 'index.handler',
  runtime: lambda.Runtime.NODEJS_20_X,
});

const invoke = new cr.AwsCustomResource(stack, 'InvokeFunction', {
  onUpdate: {
    service: 'Lambda',
    action: 'InvokeCommand',
    parameters: {
      FunctionName: fn.functionName,
    },
    physicalResourceId: cr.PhysicalResourceId.of(fn.functionArn),
  },
  policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
    resources: [fn.functionArn],
  }),
});

new cdk.CfnOutput(stack, 'FunctionStatusCode', {
  value: invoke.getResponseField('StatusCode'),
});

new IntegTest(app, 'AwsCustomResourceLambdaInvokeInteg', {
  testCases: [stack],
});
