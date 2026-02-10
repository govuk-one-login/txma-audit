#!/bin/bash

# Script to manually create the EventReplayRole from allowed IP range (VPN)
# This role requires /runbooks/ path which CodePipeline cannot create due to permissions boundary
# CloudShell cannot be used due to IP restrictions in SCP

set -e

# Check required parameters
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <stack-name> <aws-profile>"
    echo "Example: $0 audit audit-dev"
    echo ""
    echo "Note: You must be connected to VPN or on an allowed network."
    echo "      CloudShell will not work due to IP restrictions."
    exit 1
fi

STACK_NAME=$1
AWS_PROFILE=$2
ROLE_NAME="${STACK_NAME}-event-replay-role"

echo "Creating EventReplayRole: ${ROLE_NAME}"
echo "Stack: ${STACK_NAME}"
echo "AWS Profile: ${AWS_PROFILE}"
echo ""
echo "⚠️  Ensure you are connected to VPN or on an allowed network."
echo ""

# Login to AWS SSO if needed
echo "Checking AWS SSO login status..."
if ! aws sts get-caller-identity --profile ${AWS_PROFILE} &>/dev/null; then
    echo "SSO token expired or not found. Logging in..."
    aws sso login --profile ${AWS_PROFILE}
fi

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --profile ${AWS_PROFILE} --query Account --output text)
echo "Account ID: ${ACCOUNT_ID}"

# Get PermissionsBoundary from SSM if it exists
PERMISSIONS_BOUNDARY=$(aws ssm get-parameter --name "PermissionsBoundary" --profile ${AWS_PROFILE} --query Parameter.Value --output text 2>/dev/null || echo "")

# Create trust policy
TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${ACCOUNT_ID}:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "ArnLike": {
          "aws:PrincipalARN": "arn:aws:iam::${ACCOUNT_ID}:role/aws-reserved/sso.amazonaws.com/*/AWSReservedSSO_ApprovedServiceSupport*"
        }
      }
    }
  ]
}
EOF
)

# Create inline policy
INLINE_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowIAMPassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "*"
    }
  ]
}
EOF
)

# Create the role
if [ -n "$PERMISSIONS_BOUNDARY" ]; then
    aws iam create-role \
        --role-name ${ROLE_NAME} \
        --path /runbooks/ \
        --assume-role-policy-document "${TRUST_POLICY}" \
        --description "This role allows approved team members to run event replay" \
        --permissions-boundary ${PERMISSIONS_BOUNDARY} \
        --profile ${AWS_PROFILE}
else
    aws iam create-role \
        --role-name ${ROLE_NAME} \
        --path /runbooks/ \
        --assume-role-policy-document "${TRUST_POLICY}" \
        --description "This role allows approved team members to run event replay" \
        --profile ${AWS_PROFILE}
fi

echo "Role created successfully"

# Attach managed policy
aws iam attach-role-policy \
    --role-name ${ROLE_NAME} \
    --policy-arn arn:aws:iam::aws:policy/PowerUserAccess \
    --profile ${AWS_PROFILE}

echo "Attached PowerUserAccess policy"

# Add inline policy
aws iam put-role-policy \
    --role-name ${ROLE_NAME} \
    --policy-name AllowIAMPassRole \
    --policy-document "${INLINE_POLICY}" \
    --profile ${AWS_PROFILE}

echo "Added inline policy"

echo "✅ EventReplayRole created successfully: arn:aws:iam::${ACCOUNT_ID}:role/runbooks/${ROLE_NAME}"

