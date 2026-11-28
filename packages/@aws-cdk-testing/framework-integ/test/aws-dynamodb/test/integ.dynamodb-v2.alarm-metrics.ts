import { Alarm } from 'aws-cdk-lib/aws-cloudwatch';
import type { StackProps } from 'aws-cdk-lib';
import { App, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import type { Construct } from 'constructs';
import { AttributeType, Operation, TableV2 } from 'aws-cdk-lib/aws-dynamodb';

class TestStack extends Stack {
  public readonly alarm: Alarm;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new TableV2(this, 'Table', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.alarm = new Alarm(this, 'LatencyAlarm', {
      metric: table.metricSuccessfulRequestLatencyForOperation(Operation.GET_ITEM, {
        period: Duration.minutes(1),
      }),
      evaluationPeriods: 1,
      threshold: 100,
    });
  }
}

const app = new App();
const stack = new TestStack(app, 'dynamodb-v2-alarm-metrics');

const integ = new IntegTest(app, 'dynamodb-v2-alarm-metrics-integ', {
  testCases: [stack],
});

integ.assertions.awsApiCall('CloudWatch', 'describeAlarms', {
  AlarmNames: [stack.alarm.alarmName],
}).expect(ExpectedResult.objectLike({
  MetricAlarms: [{
    MetricName: 'SuccessfulRequestLatency',
    Namespace: 'AWS/DynamoDB',
    Statistic: 'Average',
  }],
}));

app.synth();
