import * as path from 'path';
import { Match, Template } from '../../assertions';
import * as iam from '../../aws-iam';
import * as kms from '../../aws-kms';
import * as cdk from '../../core';
import * as cxapi from '../../cx-api';
import { LogRetention, RetentionDays } from '../lib';

/* eslint-disable @stylistic/quote-props */

describe('log retention', () => {
  test('log retention construct', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      'PolicyDocument': {
        'Statement': [
          {
            'Action': [
              'logs:PutRetentionPolicy',
              'logs:DeleteRetentionPolicy',
            ],
            'Effect': 'Allow',
            'Resource': '*',
          },
        ],
        'Version': '2012-10-17',
      },
      'PolicyName': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
      'Roles': [
        {
          'Ref': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
        },
      ],
    });

    Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'nodejs24.x',
    });

    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      'ServiceToken': {
        'Fn::GetAtt': [
          'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
          'Arn',
        ],
      },
      'LogGroupName': 'group',
      'RetentionInDays': 30,
    });
  });

  test('set the removalPolicy to DESTROY', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      'PolicyDocument': {
        'Statement': [
          {
            'Action': [
              'logs:PutRetentionPolicy',
              'logs:DeleteRetentionPolicy',
            ],
            'Effect': 'Allow',
            'Resource': '*',
          },
          {
            'Action': 'logs:DeleteLogGroup',
            'Effect': 'Allow',
            'Resource': {
              'Fn::Join': [
                '',
                [
                  'arn:',
                  {
                    'Ref': 'AWS::Partition',
                  },
                  ':logs:',
                  {
                    'Ref': 'AWS::Region',
                  },
                  ':',
                  {
                    'Ref': 'AWS::AccountId',
                  },
                  ':log-group:group:*',
                ],
              ],
            },
          },
        ],
        'Version': '2012-10-17',
      },
      'PolicyName': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
      'Roles': [
        {
          'Ref': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
        },
      ],
    });

    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      'ServiceToken': {
        'Fn::GetAtt': [
          'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
          'Arn',
        ],
      },
      'LogGroupName': 'group',
      'RetentionInDays': 1,
      'RemovalPolicy': 'destroy',
    });
  });

  test('set the removalPolicy to RETAIN', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      'PolicyDocument': {
        'Statement': [
          {
            'Action': [
              'logs:PutRetentionPolicy',
              'logs:DeleteRetentionPolicy',
            ],
            'Effect': 'Allow',
            'Resource': '*',
          },
        ],
        'Version': '2012-10-17',
      },
      'PolicyName': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
      'Roles': [
        {
          'Ref': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
        },
      ],
    });

    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      'ServiceToken': {
        'Fn::GetAtt': [
          'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
          'Arn',
        ],
      },
      'LogGroupName': 'group',
      'RetentionInDays': 1,
      'RemovalPolicy': 'retain',
    });
  });

  describe('multiple log retention resources', () => {
    test('both removalPolicy DESTROY', () => {
      // GIVEN
      const stack = new cdk.Stack();

      // WHEN
      new LogRetention(stack, 'MyLambda1', {
        logGroupName: 'group1',
        retention: RetentionDays.ONE_DAY,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      new LogRetention(stack, 'MyLambda2', {
        logGroupName: 'group2',
        retention: RetentionDays.ONE_DAY,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        'PolicyDocument': {
          'Statement': [
            {
              'Action': [
                'logs:PutRetentionPolicy',
                'logs:DeleteRetentionPolicy',
              ],
              'Effect': 'Allow',
              'Resource': '*',
            },
            {
              'Action': 'logs:DeleteLogGroup',
              'Effect': 'Allow',
              'Resource': {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      'Ref': 'AWS::Partition',
                    },
                    ':logs:',
                    {
                      'Ref': 'AWS::Region',
                    },
                    ':',
                    {
                      'Ref': 'AWS::AccountId',
                    },
                    ':log-group:group1:*',
                  ],
                ],
              },
            },
            {
              'Action': 'logs:DeleteLogGroup',
              'Effect': 'Allow',
              'Resource': {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      'Ref': 'AWS::Partition',
                    },
                    ':logs:',
                    {
                      'Ref': 'AWS::Region',
                    },
                    ':',
                    {
                      'Ref': 'AWS::AccountId',
                    },
                    ':log-group:group2:*',
                  ],
                ],
              },
            },
          ],
          'Version': '2012-10-17',
        },
        'PolicyName': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
        'Roles': [
          {
            'Ref': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
          },
        ],
      });

      Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
        'ServiceToken': {
          'Fn::GetAtt': [
            'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
            'Arn',
          ],
        },
        'LogGroupName': 'group1',
        'RetentionInDays': 1,
        'RemovalPolicy': 'destroy',
      });

      Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
        'ServiceToken': {
          'Fn::GetAtt': [
            'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
            'Arn',
          ],
        },
        'LogGroupName': 'group2',
        'RetentionInDays': 1,
        'RemovalPolicy': 'destroy',
      });
    });

    test('with removalPolicy DESTROY and removalPolicy RETAIN', () => {
      // GIVEN
      const stack = new cdk.Stack();

      // WHEN
      new LogRetention(stack, 'MyLambda1', {
        logGroupName: 'group1',
        retention: RetentionDays.ONE_DAY,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      new LogRetention(stack, 'MyLambda2', {
        logGroupName: 'group2',
        retention: RetentionDays.ONE_DAY,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        'PolicyDocument': {
          'Statement': [
            {
              'Action': [
                'logs:PutRetentionPolicy',
                'logs:DeleteRetentionPolicy',
              ],
              'Effect': 'Allow',
              'Resource': '*',
            },
            {
              'Action': 'logs:DeleteLogGroup',
              'Effect': 'Allow',
              'Resource': {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      'Ref': 'AWS::Partition',
                    },
                    ':logs:',
                    {
                      'Ref': 'AWS::Region',
                    },
                    ':',
                    {
                      'Ref': 'AWS::AccountId',
                    },
                    ':log-group:group1:*',
                  ],
                ],
              },
            },
          ],
          'Version': '2012-10-17',
        },
        'PolicyName': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
        'Roles': [
          {
            'Ref': 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
          },
        ],
      });

      Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
        'ServiceToken': {
          'Fn::GetAtt': [
            'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
            'Arn',
          ],
        },
        'LogGroupName': 'group1',
        'RetentionInDays': 1,
        'RemovalPolicy': 'destroy',
      });

      Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
        'ServiceToken': {
          'Fn::GetAtt': [
            'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
            'Arn',
          ],
        },
        'LogGroupName': 'group2',
        'RetentionInDays': 1,
        'RemovalPolicy': 'retain',
      });
    });
  });

  test('the removalPolicy is not set', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_DAY,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      'ServiceToken': {
        'Fn::GetAtt': [
          'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
          'Arn',
        ],
      },
      'LogGroupName': 'group',
      'RetentionInDays': 1,
    });
  });

  test('with imported role', () => {
    // GIVEN
    const stack = new cdk.Stack();
    const role = iam.Role.fromRoleArn(stack, 'Role', 'arn:aws:iam::123456789012:role/CoolRole');

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
      role,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      'PolicyDocument': {
        'Statement': [
          {
            'Action': [
              'logs:PutRetentionPolicy',
              'logs:DeleteRetentionPolicy',
            ],
            'Effect': 'Allow',
            'Resource': '*',
          },
        ],
        'Version': '2012-10-17',
      },
      'PolicyName': 'RolePolicy72E7D967',
      'Roles': [
        'CoolRole',
      ],
    });

    Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 0);
  });

  test('with RetentionPeriod set to Infinity', () => {
    const stack = new cdk.Stack();

    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.INFINITE,
    });

    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      RetentionInDays: Match.absent(),
    });
  });

  test('with LogGroupRegion specified', () => {
    const stack = new cdk.Stack();
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      logGroupRegion: 'us-east-1',
      retention: RetentionDays.INFINITE,
    });

    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      LogGroupRegion: 'us-east-1',
    });
  });

  test('with encryptionKey specified', () => {
    // GIVEN
    const stack = new cdk.Stack();
    const key = new kms.Key(stack, 'Key');

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
      encryptionKey: key,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      LogGroupName: 'group',
      KmsKeyId: { 'Fn::GetAtt': ['Key961B73FD', 'Arn'] },
    });
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          {
            Action: 'logs:AssociateKmsKey',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':logs:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':log-group:group:*',
              ]],
            },
          },
        ]),
      },
    });
  });

  test('without encryptionKey no KmsKeyId and no AssociateKmsKey permission', () => {
    const stack = new cdk.Stack();

    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('Custom::LogRetention', {
      KmsKeyId: Match.absent(),
    });
    expect(JSON.stringify(template.findResources('AWS::IAM::Policy'))).not.toContain('logs:AssociateKmsKey');
  });

  test('with encryptionKey and logGroupRegion grants AssociateKmsKey in that region', () => {
    const stack = new cdk.Stack();
    const key = kms.Key.fromKeyArn(stack, 'Key', 'arn:aws:kms:us-east-1:123456789012:key/my-key');

    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      logGroupRegion: 'us-east-1',
      retention: RetentionDays.ONE_MONTH,
      encryptionKey: key,
    });

    Template.fromStack(stack).hasResourceProperties('Custom::LogRetention', {
      KmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/my-key',
    });
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          {
            Action: 'logs:AssociateKmsKey',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':logs:us-east-1:',
                { Ref: 'AWS::AccountId' },
                ':log-group:group:*',
              ]],
            },
          },
        ]),
      },
    });
  });

  test('throws when encryptionKey is in a different region than logGroupRegion', () => {
    const stack = new cdk.Stack();
    const key = kms.Key.fromKeyArn(stack, 'Key', 'arn:aws:kms:us-east-1:123456789012:key/my-key');

    expect(() => new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      logGroupRegion: 'eu-west-1',
      retention: RetentionDays.ONE_MONTH,
      encryptionKey: key,
    })).toThrow(/encryptionKey must be in the same region as the log group \(eu-west-1\), got a key in us-east-1/);
  });

  test('throws when a stack key is in a different region than logGroupRegion', () => {
    const stack = new cdk.Stack(undefined, 'Stack', { env: { region: 'us-west-2' } });
    const key = new kms.Key(stack, 'Key');

    expect(() => new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      logGroupRegion: 'us-east-1',
      retention: RetentionDays.ONE_MONTH,
      encryptionKey: key,
    })).toThrow(/encryptionKey must be in the same region as the log group \(us-east-1\), got a key in us-west-2/);
  });

  test('does not throw when the key region is unresolved', () => {
    const stack = new cdk.Stack();
    const key = new kms.Key(stack, 'Key');

    expect(() => new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      logGroupRegion: 'us-east-1',
      retention: RetentionDays.ONE_MONTH,
      encryptionKey: key,
    })).not.toThrow();
  });

  test('log group ARN is well formed and conforms', () => {
    const stack = new cdk.Stack();
    const group = new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
    });

    const logGroupArn = group.logGroupArn;
    expect(logGroupArn.indexOf('logs')).toBeGreaterThan(-1);
    expect(logGroupArn.indexOf('log-group')).toBeGreaterThan(-1);
    expect(logGroupArn.endsWith(':*')).toEqual(true);
  });

  test('log group ARN is well formed and conforms when region is specified', () => {
    const stack = new cdk.Stack();
    const group = new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      logGroupRegion: 'us-west-2',
      retention: RetentionDays.ONE_MONTH,
    });

    const logGroupArn = group.logGroupArn;
    expect(logGroupArn.indexOf('us-west-2')).toBeGreaterThan(-1);
    expect(logGroupArn.indexOf('logs')).toBeGreaterThan(-1);
    expect(logGroupArn.indexOf('log-group')).toBeGreaterThan(-1);
    expect(logGroupArn.endsWith(':*')).toEqual(true);
  });

  test('retention Lambda CfnResource receives propagated tags', () => {
    const stack = new cdk.Stack();
    cdk.Tags.of(stack).add('test-key', 'test-value');
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
    });

    Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
      Tags: [
        {
          Key: 'test-key',
          Value: 'test-value',
        },
      ],
    });
  });

  test('asset metadata added to log retention construct lambda function', () => {
    // GIVEN
    const stack = new cdk.Stack();
    stack.node.setContext(cxapi.ASSET_RESOURCE_METADATA_ENABLED_CONTEXT, true);
    stack.node.setContext(cxapi.DISABLE_ASSET_STAGING_CONTEXT, true);

    const assetLocation = path.join(__dirname, '..', '..', 'custom-resource-handlers', 'dist', 'aws-logs', 'log-retention-handler');

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_MONTH,
    });

    // Then
    Template.fromStack(stack).hasResource('AWS::Lambda::Function', {
      Metadata: {
        'aws:asset:path': assetLocation,
        'aws:asset:is-bundled': false,
        'aws:asset:property': 'Code',
      },
    });
  });

  test('function timeout is 15 minutes', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new LogRetention(stack, 'MyLambda', {
      logGroupName: 'group',
      retention: RetentionDays.ONE_DAY,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
      Timeout: 900,
    });
  });
});
