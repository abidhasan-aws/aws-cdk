import { App, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { Bucket, StorageClass } from 'aws-cdk-lib/aws-s3';

const app = new App();

const stack = new Stack(app, 's3-lifecycle-object-size-greater-than');

// A rule with only objectSizeGreaterThan, the case reported in the issue
const bucket = new Bucket(stack, 'Bucket', {
  lifecycleRules: [
    {
      id: 'MoveObjectsToIntelligentTiering',
      transitions: [{
        storageClass: StorageClass.INTELLIGENT_TIERING,
        transitionAfter: Duration.days(3),
      }],
      objectSizeGreaterThan: 1024 * 1024,
    },
  ],
  removalPolicy: RemovalPolicy.DESTROY,
});

const integ = new IntegTest(app, 'cdk-integ-s3-lifecycle-object-size-greater-than', {
  testCases: [stack],
});

integ.assertions
  .awsApiCall('S3', 'getBucketLifecycleConfiguration', {
    Bucket: bucket.bucketName,
  })
  .expect(ExpectedResult.objectLike({
    Rules: [
      {
        ID: 'MoveObjectsToIntelligentTiering',
        Filter: { ObjectSizeGreaterThan: 1048576 },
        Status: 'Enabled',
      },
    ],
  }));
