# EventReplayRole Manual Setup

## Overview

The `EventReplayRole` must be created manually outside of the CodePipeline deployment because it requires the `/runbooks/` path, which the pipeline's execution role cannot create due to permissions boundary restrictions.

## Prerequisites

- AWS CLI configured with SSO profiles
- Connected to organization VPN or allowed IP range (CloudShell won't work due to IP restrictions)
- Access to the target AWS account via SSO

## Creating the Role from Local Machine (via VPN)

### Step 1: Connect to VPN

Ensure you're connected to your organization's VPN or on an allowed network.

### Step 2: Run the Script

**For Dev Environment:**

```bash
./create-event-replay-role.sh audit-dev
```

**For Build Environment:**

```bash
./create-event-replay-role.sh audit-build
```

**For Staging Environment:**

```bash
./create-event-replay-role.sh audit-staging
```

**For Integration Environment:**

```bash
./create-event-replay-role.sh audit-integration
```

**For Production Environment:**

```bash
./create-event-replay-role.sh audit-production
```

## What the Script Does

1. Creates IAM role with name: `{stack-name}-event-replay-role`
2. Sets path to `/runbooks/`
3. Configures trust policy to allow ApprovedServiceSupport SSO role
4. Attaches PowerUserAccess managed policy
5. Adds inline policy for IAM PassRole permissions
6. Applies permissions boundary if configured in SSM

## Role Details

- **Role Name**: `audit-event-replay-role`
- **Path**: `/runbooks/`
- **Trusted Principal**: `AWSReservedSSO_ApprovedServiceSupport*` roles
- **Policies**: PowerUserAccess + IAM PassRole

## Verification

After creation, verify the role exists in CloudShell:

```bash
aws iam get-role --role-name audit-event-replay-role
```

## Execution

Export the following environment variables:

```bash
export ACCOUNT_ID=<account-id>
export AWS_PROFILE=<profile>
```

Assume the role when running an Event Replay

```bash
CREDS=$(aws sts assume-role --role-arn "arn:aws:iam::${ACCOUNT_ID}:role/runbooks/audit-event-replay-role" --role-session-name "ReplaySession" --profile $AWS_PROFILE)
```

Unset the SSO Profile and export the temporary credentials to run the replay with the assumed role:

```bash
unset AWS_PROFILE
export AWS_ACCESS_KEY_ID=$(echo $CREDS | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $CREDS | jq -r '.Credentials.SessionToken')
```

## Deletion

To delete the role from CloudShell:

```bash
aws iam detach-role-policy --role-name audit-event-replay-role --policy-arn arn:aws:iam::aws:policy/PowerUserAccess --profile $AWS_PROFILE
aws iam delete-role-policy --role-name audit-event-replay-role --policy-name AllowSTSAssumeRole --profile $AWS_PROFILE
aws iam delete-role --role-name audit-event-replay-role --profile $AWS_PROFILE
```
