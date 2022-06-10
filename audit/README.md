# Audit

This project contains source code and supporting files for creating the Audit serverless architecture.

- audit/audit-template.yaml - A template that defines the Audit AWS resources.

The application uses several AWS resources Kinesis FireHose and S3.

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 14](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)
* Yarn - [Install Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

To build and deploy your application for the first time, run the following in your shell whilst in the audit folder:

```bash
sam build --template-file audit-template.yml --config-file config/samconfig-audit.toml --config-env "<environment name>"
sam deploy --config-file config/samconfig-audit.toml --config-env "<environment name>"
```

*Deploying Locally*: When deploying locally you can specify the profile to be used for deployment by adding the profile argument e.g.

```bash
sam deploy --config-file config/samconfig-audit.toml --config-env "<environment name>" --profile <aws profile name>
```

You can also provide overrides directly when calling sam deploy if you need to provide different parameters to the stacks:

```bash
sam deploy --config-file config/samconfig-event-processing.toml --config-env "develop" --profile <aws profile name> --resolve-s3 --parameter-overrides ParameterKey=AuditAccountARN,ParameterValue=<ARN of account IAM root> ParameterKey=Environment,ParameterValue=<Environment>
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
