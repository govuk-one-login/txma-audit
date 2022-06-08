# di-txma-audit EventProcessor Tests

## Prerequisites

1. [A GDS AWS account](https://gds-request-an-aws-account.cloudapps.digital/)
2. [The GDS CLI configured](https://github.com/alphagov/gds-cli)

## Running locally

Firstly, clone the `di-txma-audit` repository.

After this, open the `di-txma-audit/tests/event-processing-tests` directory as the main project.

Then, you need to set your environment variables to match a session token which you can generate using the following command:
```bash
gds aws di-txma-build -e
```
and setting the access key, secret access key, and session token in the terminal. <br>
For Mac, simply copy the final three lines produced by the previous command and run them. <br>
For Windows, set the environment variables to the values produced.

Then, use the following gradle command
Mac:
```bash
./gradlew clean test
```
Windows:
```bash
gradlew.bat clean test
```

To view the report produced, run the following command:
``` bash
open build/reports/tests/test/index.html
```
