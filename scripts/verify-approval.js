#!/usr/bin/env node
/**
 * MOCK verify-approval.js for testing workflows.
 *
 * Controlled by MOCK_APPROVAL env var:
 *   - "success"          → approved by team member (exit 0)
 *   - "no_approval"      → PR has no approvals (exit 1)
 *   - "stale"            → approval is stale (exit 1)
 *   - "not_team_member"  → approver is not a CDK team member (exit 1)
 *
 * Default: "success" (if MOCK_APPROVAL is not set)
 */
'use strict';

const prNumber = process.argv[2];
const mockResult = process.env.MOCK_APPROVAL || 'success';

console.log(`[MOCK] verify-approval.js called for PR #${prNumber}`);
console.log(`[MOCK] MOCK_APPROVAL=${mockResult}`);

switch (mockResult) {
  case 'success':
    console.log(`[MOCK] PR #${prNumber} is approved by CDK team member: mock-reviewer`);
    process.exit(0);
    break;
  case 'no_approval':
    console.error(`[MOCK] PR #${prNumber} has no approvals`);
    process.exit(1);
    break;
  case 'stale':
    console.error(`[MOCK] Approval from mock-reviewer is stale (approved abc1234, head is now def5678)`);
    process.exit(1);
    break;
  case 'not_team_member':
    console.error(`[MOCK] PR #${prNumber} has no valid (non-stale) approval from a CDK team member`);
    process.exit(1);
    break;
  default:
    console.error(`[MOCK] Unknown MOCK_APPROVAL value: ${mockResult}`);
    process.exit(1);
}
