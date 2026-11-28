import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { LogRetention, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { StackProps } from 'aws-cdk-lib/core';
import { App, Stack, RemovalPolicy } from 'aws-cdk-lib/core';

class LogRetentionKmsIntegStack extends Stack {
  public readonly key: kms.Key;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.key = new kms.Key(this, 'Key', {
      removalPolicy: RemovalPolicy.DESTROY,
    });
    // CloudWatch Logs must be allowed to use the key to encrypt the log group
    this.key.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['kms:Encrypt*', 'kms:Decrypt*', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:Describe*'],
      principals: [new iam.ServicePrincipal(`logs.${this.region}.amazonaws.com`)],
      resources: ['*'],
    }));

    new LogRetention(this, 'MyLambda', {
      logGroupName: 'logRetentionKmsLogGroup',
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
      encryptionKey: this.key,
    });
  }
}

const app = new App();
const stack = new LogRetentionKmsIntegStack(app, 'aws-cdk-log-retention-kms-integ');
const integ = new IntegTest(app, 'LogRetentionKmsInteg', {
  testCases: [stack],
  diffAssets: true,
});

integ.assertions.awsApiCall('CloudWatchLogs', 'describeLogGroups', {
  logGroupNamePrefix: 'logRetentionKmsLogGroup',
}).expect(ExpectedResult.objectLike({
  logGroups: [{
    logGroupName: 'logRetentionKmsLogGroup',
    kmsKeyId: stack.key.keyArn,
  }],
}));

app.synth();
