import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { EC2_RESTRICT_DEFAULT_SECURITY_GROUP } from 'aws-cdk-lib/cx-api';
import { IntegTest } from '@aws-cdk/integ-tests-alpha';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'aws-cdk-ec2-vpn-connection-customer-asn');
stack.node.setContext(EC2_RESTRICT_DEFAULT_SECURITY_GROUP, false);

const vpc = new ec2.Vpc(stack, 'Vpc', {
  ipAddresses: ec2.IpAddresses.cidr('10.10.0.0/16'),
  maxAzs: 1,
  natGateways: 0,
});

// The VPC has no VPN gateway, so the connection creates one. The customer
// ASN must not be reused as the Amazon side ASN of that gateway, or the
// deployment fails because both sides share the same ASN.
new ec2.VpnConnection(stack, 'VpnConnection', {
  vpc,
  ip: '52.85.255.164',
  asn: 65001,
});

new IntegTest(app, 'VpnConnectionCustomerAsnTest', {
  testCases: [stack],
});
