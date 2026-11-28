import * as path from 'path';
import type { StackProps } from 'aws-cdk-lib';
import { App, Stack } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { IntegTest } from '@aws-cdk/integ-tests-alpha';

/*
 * The bundled asset must keep non-ASCII characters unescaped when
 * `charset: Charset.UTF8` is set. `diffAssets` records the bundled
 * code in the snapshot so a regression shows up as a diff.
 */
class TestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new lambda.NodejsFunction(this, 'charset-utf8', {
      entry: path.join(__dirname, 'integ-handlers/charset.ts'),
      bundling: {
        format: lambda.OutputFormat.ESM,
        charset: lambda.Charset.UTF8,
      },
    });
  }
}

const app = new App({
  postCliContext: {
    '@aws-cdk/aws-lambda:useCdkManagedLogGroup': false,
  },
});
const stack = new TestStack(app, 'cdk-integ-lambda-nodejs-charset');

new IntegTest(app, 'LambdaNodeJsCharsetInteg', {
  testCases: [stack],
  diffAssets: true,
});
app.synth();
