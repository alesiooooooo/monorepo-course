# monorepo-course

Development-only backend deployment for `learn-aws-dev`.

## Scope

- Current workflow deploys only the `dev` environment from branch `master`.
- Deploy target is one EC2 instance with PM2-managed Node services:
  - `auth-service`
  - `orders-service`
  - `payments-service`
- GitHub Actions uses AWS OIDC to assume an IAM role.
- Rollout runs through AWS SSM on the target EC2 instance.
- A temporary EC2 GitHub runner is started for the deploy and stopped afterward.

## What The Deploy Workflow Does

Workflow: [`.github/workflows/deploy-dev.yml`](./.github/workflows/deploy-dev.yml)

On every push to `master` it:

1. Assumes an AWS IAM role from GitHub Actions.
2. Reads CloudFormation outputs from stack `services-dev`.
3. Starts a temporary EC2 GitHub runner with `machulav/ec2-github-runner`.
4. Sends an SSM command to the services EC2 instance.
5. On the target host:
   - clones or updates the repo in `/opt/apps/monorepo-course`
   - runs `npm install`
   - runs `npm run build`
   - syncs env files from SSM Parameter Store
   - runs migrations script
   - reloads PM2 processes
   - runs simple health checks
6. Stops the temporary runner.

Only one `dev` deploy is allowed at a time because the workflow uses `concurrency`.

## AWS Prerequisites

This repository does not create the GitHub Actions IAM/OIDC setup automatically. It must already exist in AWS and GitHub before the workflow can succeed.

Infrastructure outside this repo must provide a CloudFormation stack named `services-dev` with these outputs:

- `RunnerSubnetId`
- `RunnerSecurityGroupId`
- `RunnerInstanceProfileName`
- `ServicesEc2InstanceId`

The services EC2 instance must also have:

- SSM Agent working
- an instance profile that allows SSM access
- Node.js, npm, PM2, and build dependencies available for the deploy command

## GitHub Repository Setup

Open `Settings -> Secrets and variables -> Actions`.

### Required secrets

- `AWS_ROLE_ARN`
  - IAM role ARN assumed by `aws-actions/configure-aws-credentials@v4`
- `GH_PAT`
  - GitHub Personal Access Token used for `git clone` and `git fetch` on the target EC2 host

### Required variables

- `AWS_REGION`
  - AWS region used by the workflow, for example `eu-central-1`

If these values are missing, the workflow will fail. They are not created automatically by GitHub.

## AWS OIDC Setup For GitHub Actions

GitHub Actions in this repo uses OIDC, not static AWS access keys.

### 1. Create the GitHub OIDC provider in AWS

In AWS `IAM -> Identity providers -> Add provider`:

- Provider type: `OpenID Connect`
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

Provider ARN format:

`arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com`

### 2. Create an IAM role for GitHub Actions

Create a role that allows `sts:AssumeRoleWithWebIdentity` from that provider and restricts access to this repository and branch.

Example trust policy for pushes to `master`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/heads/master"
        }
      }
    }
  ]
}
```

Replace:

- `ACCOUNT_ID` with your AWS account ID
- `OWNER/REPO` with the exact GitHub repository path

### 3. Attach permissions to that role

The workflow needs permissions for at least:

- CloudFormation read access for stack outputs
- SSM send-command and get-command-invocation
- EC2 runner lifecycle used by `machulav/ec2-github-runner`
- IAM pass-role for the temporary runner instance profile, if required by your setup
- SSM parameter read access for deploy-time env sync

Do not start with broad admin permissions unless you are debugging in a sandbox account.

### 4. Save the role ARN in GitHub

Store the created role ARN as repository secret `AWS_ROLE_ARN`.

### How to create `AWS_ROLE_ARN` step by step

1. Open AWS Console.
2. Go to `IAM -> Identity providers`.
3. If GitHub OIDC provider does not exist, create it:
   - Provider type: `OpenID Connect`
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
4. Go to `IAM -> Roles -> Create role`.
5. Choose `Web identity`.
6. Select provider `token.actions.githubusercontent.com`.
7. Select audience `sts.amazonaws.com`.
8. Add a trust policy restricted to this repository and branch `master`.
9. Attach the AWS permissions required by this workflow.
10. Create the role and copy its ARN.
11. In GitHub open `Settings -> Secrets and variables -> Actions -> Secrets`.
12. Create repository secret `AWS_ROLE_ARN` and paste the copied ARN.

Example ARN:

`arn:aws:iam::123456789012:role/github-actions-monorepo-course-deploy`

## Runtime Config In SSM Parameter Store

Deploy-time env sync uses [deploy/scripts/sync-env.sh](./deploy/scripts/sync-env.sh).

Expected parameter paths:

- `/monorepo-course/learn-aws-dev/auth/*`
- `/monorepo-course/learn-aws-dev/orders/*`
- `/monorepo-course/learn-aws-dev/payments/*`

Each parameter name becomes an env var in:

- `deploy/.env.auth`
- `deploy/.env.orders`
- `deploy/.env.payments`

## Deploy Scripts

- [deploy/scripts/sync-env.sh](./deploy/scripts/sync-env.sh)
  - downloads env values from SSM Parameter Store
- [deploy/scripts/render-env.sh](./deploy/scripts/render-env.sh)
  - validates that per-service env files exist
- [deploy/scripts/run-migrations.sh](./deploy/scripts/run-migrations.sh)
  - currently no-op; prints that migrations are skipped
- [deploy/ecosystem.config.js](./deploy/ecosystem.config.js)
  - PM2 app definitions for the three services

## Current Gaps

- No `staging` or `production` workflow yet
- `GH_PAT` is still required for server-side git access
- No reverse proxy or ALB-based app ingress in this repo
- No migrations implemented yet
- No infrastructure-as-code for the GitHub Actions IAM/OIDC setup in this repo

## How To Create `GH_PAT`

`GH_PAT` is a GitHub Personal Access Token used by the target EC2 instance to run `git clone` and `git fetch` against this repository during deploy.

### Steps

1. Open GitHub.
2. Go to `Settings -> Developer settings -> Personal access tokens`.
3. Create a new token.
4. Prefer a fine-grained token if your repository access model allows it.
5. Grant access only to this repository.
6. Grant the minimum repository permissions needed for clone and fetch.
   - For a private repository, `Contents: Read-only` is usually enough.
7. Copy the token value when GitHub shows it. You will not be able to see it again later.
8. Open this repository in GitHub.
9. Go to `Settings -> Secrets and variables -> Actions -> Secrets`.
10. Create repository secret `GH_PAT`.
11. Paste the token value into that secret.

### Notes

- `GH_PAT` is not created automatically.
- GitHub Actions does not generate this token for your EC2 host.
- If the repository becomes public or deploy stops doing server-side `git clone`/`git fetch`, this secret may become unnecessary.
