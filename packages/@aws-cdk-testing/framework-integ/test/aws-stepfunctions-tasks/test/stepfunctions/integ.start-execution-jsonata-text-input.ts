import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { App, Stack } from 'aws-cdk-lib';
import { StepFunctionsStartExecution } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as integ from '@aws-cdk/integ-tests-alpha';

/*
 * A JSONata expression from `TaskInput.fromText` is accepted as the input of a
 * child execution when `associateWithParent` is enabled, and is merged with the
 * parent execution ID.
 */
const app = new App();
const stack = new Stack(app, 'integ-sfn-start-execution-jsonata-text-input');

const child = new sfn.StateMachine(stack, 'Child', {
  definitionBody: sfn.DefinitionBody.fromChainable(new sfn.Pass(stack, 'Pass')),
});

const parent = new sfn.StateMachine(stack, 'Parent', {
  definitionBody: sfn.DefinitionBody.fromChainable(StepFunctionsStartExecution.jsonata(stack, 'Task', {
    stateMachine: child,
    input: sfn.TaskInput.fromText('{% $merge([$states.input, { "extra": "value" }]) %}'),
    integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    associateWithParent: true,
  })),
});

const integTest = new integ.IntegTest(app, 'integ-sfn-start-execution-jsonata-text-input-integ', {
  testCases: [stack],
});

const startExecutionCall = integTest.assertions.awsApiCall('StepFunctions', 'startExecution', {
  stateMachineArn: parent.stateMachineArn,
  input: JSON.stringify({
    hello: 'world',
  }),
});

integTest.assertions.awsApiCall('StepFunctions', 'describeExecution', {
  executionArn: startExecutionCall.getAttString('executionArn'),
  includedData: 'METADATA_ONLY',
})
  .expect(integ.ExpectedResult.objectLike({
    status: 'SUCCEEDED',
  }))
  .waitForAssertions();
