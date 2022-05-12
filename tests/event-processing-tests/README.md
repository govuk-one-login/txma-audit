# di-txma-audit EventProcessor Tests

## Running locally

First start the Message Server (used to subscribe to the SNS topic)
```bash
./gradlew bootRun
```
Then run the tests through the ide or with the following gradle command
```bash
./gradlew clean cucumber
```
