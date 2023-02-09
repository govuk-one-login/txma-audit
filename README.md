# di-txma-audit

Digital Identity Auditing Services

This project contains source code and supporting files for creating the Event Processor and Audit serverless architecture.

## PreRequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 18 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally and run integration tests
- [Yarn](https://yarnpkg.com/getting-started/install) version 3 - The package manager for the project
- [Checkov](https://www.checkov.io/) - Scans cloud infrastructure configurations to find misconfigurations before they're deployed. Added as a Husky pre-commit hook.
- [Husky](https://typicode.github.io/husky/#/?id=install) - For pre-push validations
- [Yelp/detect-secrets](https://github.com/Yelp/detect-secrets) - For detecting secrets in codebase

Enable Git Hooks to be used with Husky. In the root of the project run the following command:

```bash
yarn husky install
```

Also, if running on Linux you may need to make sure the Husky scripts are executable:

```bash
chmod ug+x .husky/*
chmod ug+x .git/hooks/*
```

## Getting Started

The project is using [Yarn Zero Installs](https://yarnpkg.com/features/zero-installs). So as long as Yarn itself is installed, everything should be ready to go out of the box. As long as you are running Node v16.10+, the easiest way to install Yarn is to enable corepack.

```
corepack enable
```

Zero installs works because the dependencies are committed via the `.yarn` folder. These are all compressed, so the folder size is much smaller than `node_modules` would be.

In order to ensure that dependencies cannot be altered by anything other than Yarn itself, we run `yarn install --check-cache` in the pipeline. This avoids the possibility of malicous users altering any dependency code.The project is using [Yarn Zero Installs](https://yarnpkg.com/features/zero-installs). So as long as Yarn itself is installed, everything should be ready to go out of the box. As long as you are running Node v16.10+, the easiest way to install Yarn is to enable corepack.

```
corepack enable
```

Then the only other thing that needs to be enabled is the Husky hooks.

```
yarn husky install
```

Zero installs works because the dependencies are committed via the `.yarn` folder. These are all compressed, so the folder size is much smaller than `node_modules` would be.

In order to ensure that dependencies cannot be altered by anything other than Yarn itself, we run `yarn install --check-cache` in the pipeline. This avoids the possibility of malicous users altering any dependency code.

## Audit

The Audit account uses a Kinesis FireHose resource to subscribe to the SNS topic hosted in the Event Processing account. This will batch and store the RAW event messages in an S3 bucket.

Access to this account is restricted in order to prevent access to the sensitive PII data.

Limited access will be granted in order to retrieve records that need to be audited. We will allow these records to be viewed for a limited time frame using the AWS Athena tool.

The Audit account contains the following infrastructure:

- Lambda
- Kinesis FireHose
- KMS
- S3

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

- SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- Node.js - [Install Node.js 18](https://nodejs.org/en/), including the NPM package management tool.
- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)
- Yarn - [Install Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

To build and deploy your application for the first time, run the following from the root directory:

```bash
yarn build
sam deploy --stack-name audit --parameter-overrides ParameterKey=Environment,ParameterValue=dev --resolve-s3 --capabilities CAPABILITY_NAMED_IAM
```

_Note_: When deploying the event processor also include the `--resolve-s3` argument in order to automatically create an s3 bucket to store the lambda zip.

_Deploying Locally_: When deploying locally you can specify the profile to be used for deployment by adding the profile argument e.g.

```bash
sam deploy --config-file config/samconfig-<account-name>.toml --config-env "<environment name>" --profile <aws profile name>
```

You can also provide overrides directly when calling sam deploy if you need to provide different parameters to the stacks:

```bash
sam deploy --config-file config/samconfig-event-processing.toml --config-env "develop" --profile di-dev-admin --resolve-s3 --parameter-overrides ParameterKey=AuditAccountARN,ParameterValue=<ARN of account IAM root> ParameterKey=Environment,ParameterValue=<Environment>
```

_Note_: When calling SAM deploy against a template containing a Lambda function make sure to omit the template name argument. If this is not done, the source files will be deployed instead of the compiled files located in .aws-sam.

#### Available Environments

- dev (sandbox only)
- build
- staging
- integration
- production

## Use the SAM CLI to test locally

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `invoke-events` folder in this project.

Environment variables can be provided to the function by providing JSON to the `env-vars` parameter. An example can be found in `invoke-vars`.

The event type we use for the event-processor lambda is an SQSEvent.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
event-processor$ sam local invoke <function name> --event invoke-events/event.json --env-vars invoke-vars/environment-vars.json --profile <dev acccount profile>
```

You can also test against a Lambda deployed into the Dev environment using the AWS CLI:

```bash
event-processor$ aws lambda invoke --function-name <function name> --invocation-type Event --payload "<base64 encoded event json>" outfile.txt --profile <AWSProfileForTheTargetAccount>
```

## Unit tests

Use yarn to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
yarn test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name <stack-name>
```

You can find the stack name defined in the files: `samconfig.toml`

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

- [Lambda Destinations](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-destinations/)
- [Testing Lambdas](https://www.trek10.com/blog/lambda-destinations-what-we-learned-the-hard-way)
- [AWS SAM TypeScript](https://aws.amazon.com/blogs/compute/building-typescript-projects-with-aws-sam-cli/)
- [Deploying Lambdas](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)
