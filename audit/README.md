# Audit

This project contains source code and supporting files for creating the Audit serverless architecture.

- audit/audit-template.yaml - A template that defines the Audit AWS resources.

The application uses several AWS resources Kinesis FireHose and S3.

## Pre-requisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 14 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally and run integration tests
- [Yarn](https://yarnpkg.com/getting-started/install) version 3 - The package manager for the project
- [Checkov](https://www.checkov.io/) - Scans cloud infrastructure configurations to find misconfigurations before they're deployed. Added as a Husky pre-commit hook.
- [Husky](https://typicode.github.io/husky/#/?id=install) - For pre-commit and pre-push validations

Enable Git Hooks to be used with Husky. In the root of the project run the following command:
```bash
npx husky install
```

Also, if running on Linux you may need to make sure the Husky scripts are executable:
```bash
chmod ug+x .husky/*   
chmod ug+x .git/hooks/*
```

The deployment of the resources contained here rely on the following AWS System Manager Parameters being available in the audit account:

* EventProcessorSNSTopicARN - Event Processing SNS topic ARN
* SNSKMSKeyARN - KMS key used for encryption on the Event Processing SNS topic
* EventProcessorAccountARN - ARN for the Event Processing Account
* CSLSLogsDestination - ARN for cyber hosted Lambda used to process logs
* CSLSS3LambdaARN - ARN for cyber hosted Lambda used to process S3 logs
* CSLSS3QueueARN - ARN for cyber hosted queue used to receive notifications of object events in S3

You can see these values being referenced throughout the audit-template file in the following format:

`"{{resolve:ssm:EventProcessorSNSTopicARN}}"`

See the following on how to create the parameters via:

* [AWS Console](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html)
* [AWS CLI](https://docs.aws.amazon.com/systems-manager/latest/userguide/param-create-cli.html)
* [Powershell](https://docs.aws.amazon.com/systems-manager/latest/userguide/param-create-ps.html)
* [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ssm-parameter.html)


## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 14](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)
* Yarn - [Install Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

To build and deploy your application for the first time, create an S3 bucket to store the code, and run the following in your shell whilst in the audit folder:

```bash
sam build --template-file audit-template.yml --config-file config/samconfig-audit.toml --config-env "<environment name>"  --use-container --beta-features
sam deploy --config-file config/samconfig-audit.toml --config-env "<environment name>" --s3-bucket "<bucket name>"
```

*Deploying Locally*: When deploying locally you can specify the profile to be used for deployment by adding the profile argument e.g.

```bash
sam deploy --config-file config/samconfig-audit.toml --config-env "<environment name>" --s3-bucket "<bucket name>" --profile <aws profile name>
```

You can also provide overrides directly when calling sam deploy if you need to provide different parameters to the stacks:

```bash
sam deploy --config-file config/samconfig-event-processing.toml --config-env "<environment name>" --s3-bucket "<bucket name>" --profile <aws profile name> --resolve-s3 --parameter-overrides ParameterKey=AuditAccountARN,ParameterValue=<ARN of account IAM root> ParameterKey=Environment,ParameterValue=<Environment>
```

#### Available Environments

- dev
- build
- staging
- integration
- production

## Cleanup

To delete the application, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name <stack-name>
```

You can find the stack names defined in the config file:

- audit/config/samconfig-audit.toml

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

- [Lambda Destinations](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-destinations/)
- [Testing Lambdas](https://www.trek10.com/blog/lambda-destinations-what-we-learned-the-hard-way)
- [AWS SAM TypeScript](https://aws.amazon.com/blogs/compute/building-typescript-projects-with-aws-sam-cli/)
- [Deploying Lambdas](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)
