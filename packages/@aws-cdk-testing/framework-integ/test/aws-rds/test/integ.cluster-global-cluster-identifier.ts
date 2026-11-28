import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App } from 'aws-cdk-lib';
import { AuroraMysqlEngineVersion, CfnGlobalCluster, ClusterInstance, DatabaseCluster, DatabaseClusterEngine } from 'aws-cdk-lib/aws-rds';
import { IntegTestBaseStack } from './integ-test-base-stack';

const app = new App();
const stack = new IntegTestBaseStack(app, 'cluster-global-cluster-identifier');

const vpc = new ec2.Vpc(stack, 'VPC', { maxAzs: 2, restrictDefaultSecurityGroup: false });

const engineVersion = AuroraMysqlEngineVersion.VER_3_07_1;

const globalCluster = new CfnGlobalCluster(stack, 'GlobalCluster', {
  engine: 'aurora-mysql',
  engineVersion: engineVersion.auroraMysqlFullVersion,
});

const cluster = new DatabaseCluster(stack, 'Database', {
  vpc,
  engine: DatabaseClusterEngine.auroraMysql({ version: engineVersion }),
  writer: ClusterInstance.provisioned('Writer', {
    // global databases do not support burstable instance classes
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.LARGE),
  }),
  globalClusterIdentifier: globalCluster.ref,
});

const integTest = new IntegTest(app, 'cluster-global-cluster-identifier-integ', {
  testCases: [stack],
});

integTest.assertions.awsApiCall('RDS', 'describeGlobalClusters', {
  GlobalClusterIdentifier: globalCluster.ref,
}).assertAtPath(
  'GlobalClusters.0.GlobalClusterMembers.0.DBClusterArn',
  ExpectedResult.stringLikeRegexp(cluster.clusterIdentifier),
);
