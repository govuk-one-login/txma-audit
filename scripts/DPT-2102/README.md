# DeployRole IAM Fix

## Overview

The pipeline's `DeployRole` lacks permissions to manage inline policies on the `TestRole`. This causes `CREATE_FAILED` on the `TestRoleKmsAccessPolicy` resource during `sam deploy`.

## Usage

```bash
cd scripts/deploy-role-fix
chmod +x apply-deploy-role-iam-fix.sh
./apply-deploy-role-iam-fix.sh <aws-profile>
```

### Examples

```bash
# Build environment
./apply-deploy-role-iam-fix.sh audit-build

# Staging environment
./apply-deploy-role-iam-fix.sh audit-staging
```

## What the Script Does

1. Discovers the `DeployRole` and `TestRole` names via `iam:ListRoles`
2. Builds an inline policy granting:
   - `iam:GetRole`, `iam:GetRolePolicy`, `iam:PutRolePolicy`, `iam:DeleteRolePolicy` on the TestRole
   - `iam:PassRole` on `audit-*` roles scoped to Lambda, Firehose, and CodeDeploy services
3. Shows a preview and asks for confirmation
4. Attaches the inline policy to the DeployRole
5. Verifies the policy was applied

## Rollback

To remove the inline policy:

```bash
aws iam delete-role-policy \
    --role-name <DeployRole-name> \
    --policy-name ManageTestRolePermissions \
    --profile <aws-profile>
```

## Permissions Granted

| Action                 | Resource        | Purpose                                                        |
| ---------------------- | --------------- | -------------------------------------------------------------- |
| `iam:GetRole`          | TestRole        | CloudFormation describes the role before policy attachment     |
| `iam:GetRolePolicy`    | TestRole        | CloudFormation reads existing inline policies (drift check)    |
| `iam:PutRolePolicy`    | TestRole        | CloudFormation creates/updates the inline KMS policy           |
| `iam:DeleteRolePolicy` | TestRole        | CloudFormation removes the policy on stack delete/rollback     |
| `iam:PassRole`         | `audit-*` roles | CloudFormation assigns IAM roles to Lambda/Firehose/CodeDeploy |
