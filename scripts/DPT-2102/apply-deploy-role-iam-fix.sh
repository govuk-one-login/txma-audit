#!/bin/bash

# Script to attach IAM permissions to the DeployRole, allowing it to manage
# inline policies on the TestRole during SAM deployments.

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <aws-profile>"
    echo "Example: $0 audit-build"
    echo ""
    echo "Attaches an inline policy to the pipeline DeployRole granting it"
    echo "permissions to manage inline policies on the TestRole."
    exit 1
fi

AWS_PROFILE=$1
AWS_REGION="${AWS_REGION:-eu-west-2}"

echo "==> Checking AWS SSO session"
if ! aws sts get-caller-identity --profile "${AWS_PROFILE}" > /dev/null 2>&1; then
    echo "==> Session expired, logging in"
    aws sso login --profile "${AWS_PROFILE}"
fi

ACCOUNT_ID=$(aws sts get-caller-identity --profile "${AWS_PROFILE}" --query Account --output text)
echo "Account ID: ${ACCOUNT_ID}"

# ──────────────────────────────────────────────
# Discover the DeployRole and TestRole names
# ──────────────────────────────────────────────
echo "==> Discovering pipeline roles"

DEPLOY_ROLE_NAME=$(aws iam list-roles \
    --profile "${AWS_PROFILE}" \
    --query "Roles[?contains(RoleName, 'audit') && contains(RoleName, 'DeployRole')].RoleName | [0]" \
    --output text)

TEST_ROLE_NAME=$(aws iam list-roles \
    --profile "${AWS_PROFILE}" \
    --query "Roles[?contains(RoleName, 'audit') && contains(RoleName, 'TestRole')].RoleName | [0]" \
    --output text)

if [ "${DEPLOY_ROLE_NAME}" = "None" ] || [ -z "${DEPLOY_ROLE_NAME}" ]; then
    echo "❌ Could not find a DeployRole containing 'audit' and 'DeployRole'. Aborting."
    exit 1
fi

if [ "${TEST_ROLE_NAME}" = "None" ] || [ -z "${TEST_ROLE_NAME}" ]; then
    echo "⚠️  Could not find a TestRole. Will use wildcard pattern."
    TEST_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/PL-audit-*-TestRole-*"
else
    TEST_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${TEST_ROLE_NAME}"
fi

echo "    DeployRole : ${DEPLOY_ROLE_NAME}"
echo "    TestRole   : ${TEST_ROLE_ARN}"

# ──────────────────────────────────────────────
# Build the policy document
# ──────────────────────────────────────────────
POLICY_NAME="ManageTestRolePermissions"

POLICY_DOCUMENT=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowManageTestRoleInlinePolicies",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy"
      ],
      "Resource": "${TEST_ROLE_ARN}"
    },
    {
      "Sid": "AllowPassRoleForStackServices",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::${ACCOUNT_ID}:role/audit-*",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": [
            "lambda.amazonaws.com",
            "firehose.amazonaws.com",
            "codedeploy.eu-west-2.amazonaws.com"
          ]
        }
      }
    }
  ]
}
EOF
)

# ──────────────────────────────────────────────
# Preview and confirm
# ──────────────────────────────────────────────
echo ""
echo "==> Policy to attach as inline policy '${POLICY_NAME}' on role '${DEPLOY_ROLE_NAME}':"
echo "${POLICY_DOCUMENT}" | python3 -m json.tool
echo ""
read -r -p "Apply this policy? (y/N): " CONFIRM
if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# ──────────────────────────────────────────────
# Apply the inline policy
# ──────────────────────────────────────────────
echo "==> Attaching inline policy to ${DEPLOY_ROLE_NAME}"
aws iam put-role-policy \
    --role-name "${DEPLOY_ROLE_NAME}" \
    --policy-name "${POLICY_NAME}" \
    --policy-document "${POLICY_DOCUMENT}" \
    --profile "${AWS_PROFILE}" \
    --region "${AWS_REGION}"

echo ""
echo "✅ Policy '${POLICY_NAME}' attached to '${DEPLOY_ROLE_NAME}'"

# ──────────────────────────────────────────────
# Verify
# ──────────────────────────────────────────────
echo "==> Verifying policy"
aws iam get-role-policy \
    --role-name "${DEPLOY_ROLE_NAME}" \
    --policy-name "${POLICY_NAME}" \
    --profile "${AWS_PROFILE}" \
    --query PolicyDocument \
    --output json | python3 -m json.tool

echo ""
echo "✅ Done. You can now re-run 'sam deploy' for the audit stack."


