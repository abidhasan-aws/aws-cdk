import { Aws } from 'aws-cdk-lib';
import { Arn, ArnFormat, Grant, IGrantable } from 'aws-cdk-lib';

export class CrossRegionInferenceProfile {
  private readonly inferenceProfileId: string;

  constructor(inferenceProfileId: string) {
    this.inferenceProfileId = inferenceProfileId;
  }

  public grantProfileUsage(grantee: IGrantable): Grant {
    const resourceArn = Arn.format({
      partition: Aws.PARTITION,
      service: 'bedrock',
      account: Aws.ACCOUNT_ID,
      region: '*', // Allow all regions within the partition
      resource: 'inference-profile',
      resourceName: this.inferenceProfileId,
      arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
    });

    return Grant.addToPrincipal({
      grantee: grantee,
      actions: ['bedrock:GetInferenceProfile', 'bedrock:InvokeModel*'],
      resourceArns: [resourceArn],
    });
  }
}