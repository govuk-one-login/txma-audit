#!/usr/bin/env sh
# AWS_PROFILE="audit-dev"

echo "\x1b[33m removing old files: cf-template.yaml and template.zip\x1b[0m"
rm cf-template.yaml
rm template.zip
echo "\x1b[32m removing old files: complete \x1b[0m"

echo "\x1b[33m sam build: running \x1b[0m"
sam build --template-file audit-template.yml --config-file config/samconfig-audit.toml --config-env dev --use-container --beta-features
echo "\x1b[32m sam build: complete \x1b[0m"

echo "\x1b[33m sam package: running \x1b[0m"
sam package --region eu-west-2 --s3-bucket="audit-pipeline-artifact-bucket" --output-template-file=cf-template.yaml --signing-profiles DelimiterFunction="SigningProfile_qK5A76J3Mq0E" firehoseTesterFunction="SigningProfile_qK5A76J3Mq0E" InitiateCopyAndEncryptFunction="SigningProfile_qK5A76J3Mq0E"
echo "\x1b[32m sam package: complete \x1b[0m"

echo "\x1b[33m zip template: running \x1b[0m"
zip -FS "template.zip" "cf-template.yaml"
echo "\x1b[32m zip template: complete \x1b[0m"

echo "\x1b[33m s3 upload: running \x1b[0m"
aws s3 cp template.zip "s3://audit-pipeline-artifact-bucket/template.zip" 
echo "\x1b[32m s3 complete: complete \x1b[0m"


echo "\x1b[32m Check AWS codepipeline using the audit account/role \x1b[0m"
