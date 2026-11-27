import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from '../../../bedrock';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'aws-cdk-bedrock-cross-region-profile-grants-integ', {
  env: {
    region: 'eu-central-1',
  },
});

const crossRegionProfile = bedrock.CrossRegionInferenceProfile.fromConfig({
  geoRegion: bedrock.CrossRegionInferenceProfileRegion.EU,
  model: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V1_0,
});

// The policy must allow the inference profile in every region it routes to
const role = new iam.Role(stack, 'InvokerRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
});
crossRegionProfile.grantInvoke(role);

new IntegTest(app, 'BedrockCrossRegionProfileGrantsTest', {
  testCases: [stack],
});
