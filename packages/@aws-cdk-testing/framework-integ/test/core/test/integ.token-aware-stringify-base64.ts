import * as cdk from 'aws-cdk-lib/core';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';

/**
 * Checks that string literals inside Fn::Base64 are not JSON-escaped when the
 * value is embedded in a JSON string with toJsonString().
 */

const app = new cdk.App();
const stack = new cdk.Stack(app, 'TokenAwareStringifyBase64');

const parameter = new ssm.StringParameter(stack, 'Parameter', {
  stringValue: stack.toJsonString({
    encoded: cdk.Fn.base64(cdk.Fn.sub('{"key":"value"}')),
  }),
});

const integ = new IntegTest(app, 'TokenAwareStringifyBase64Test', {
  testCases: [stack],
});

integ.assertions.awsApiCall('SSM', 'getParameter', {
  Name: parameter.parameterName,
}).expect(ExpectedResult.objectLike({
  Parameter: {
    // base64 of {"key":"value"}
    Value: JSON.stringify({ encoded: Buffer.from('{"key":"value"}').toString('base64') }),
  },
}));
