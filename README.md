# TxMA Audit

Digital Identity Auditing Services

This project contains source code and supporting files for creating the Event Processor and Audit serverless architecture.

## PreRequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 22 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally and run integration tests
- [Checkov](https://www.checkov.io/) - Scans cloud infrastructure configurations to find misconfigurations before they're deployed. Added as a Husky pre-commit hook.
- [Husky](https://typicode.github.io/husky/#/?id=install) - For pre-push validations

## Getting Started

The project uses NPM. To get started run

```bash
npm install
```

to install dependencies. The npm `postinstall` script should take care of installing husky.

If running on Linux you may need to make sure the Husky scripts are executable:

```bash
chmod ug+x .husky/*
chmod ug+x .git/hooks/*
```

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
- Node.js - [Install Node.js 22](https://nodejs.org/en/), including the NPM package management tool.
- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following from the root directory:

```bash
npm run deploy:dev
```

_Note 1_: The SAM deploy command the script runs contains the `--resolve-s3` argument in order to automatically create an s3 bucket to store the lambda zip.

_Note 2_: When deploying locally you can change which AWS profile from your config file is used by updating the `AWS_PROFILE` environment variable e.g.

```bash
export AWS_PROFILE=<aws profile name>
npm run deploy:dev
```

You can also provide overrides directly when calling sam deploy if you need to provide different parameters to the stacks:

```bash
sam deploy --config-file config/samconfig-local.toml --config-env "dev" --profile di-dev-admin --resolve-s3 --parameter-overrides ParameterKey=AuditAccountARN,ParameterValue=<ARN of account IAM root> ParameterKey=Environment,ParameterValue=<Environment>
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
sam local invoke <function name> --event invoke-events/event.json --env-vars invoke-vars/environment-vars.json --profile <dev acccount profile>
```

You can also test against a Lambda deployed into the Dev environment using the AWS CLI:

```bash
aws lambda invoke --function-name <function name> --invocation-type Event --payload "<base64 encoded event json>" outfile.txt --profile <AWSProfileForTheTargetAccount>
```

## Unit tests

Unit tests use the [Jest test framework](https://jestjs.io/) and are run with npm.

```bash
npm run test
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
