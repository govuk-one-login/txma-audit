echo "\x1b[33m removing old files: cf-template.yaml and template.zip\x1b[0m"
rm cf-template.yaml
rm template.zip
echo "\x1b[32m removing old files: complete \x1b[0m"

echo "\x1b[33m sam build: running \x1b[0m"
sam build --template-file event-processing-template.yml --config-file config/samconfig-event-processing.toml --config-env dev --use-container --beta-features
echo "\x1b[32m sam build: complete \x1b[0m"

echo "\x1b[33m sam package: running \x1b[0m"
sam package --s3-bucket="artifact-source-bucket-txma-ep-dev" --output-template-file=cf-template.yaml --signing-profiles KBVEventProcessorFunction="SigningProfile_dGACRT7iNHV4" KBVAddressEventProcessorFunction="SigningProfile_dGACRT7iNHV4" KBVFraudEventProcessorFunction="SigningProfile_dGACRT7iNHV4" IPVEventProcessorFunction="SigningProfile_dGACRT7iNHV4" IPVPassEventProcessorFunction="SigningProfile_dGACRT7iNHV4" SPOTEventProcessorFunction="SigningProfile_dGACRT7iNHV4" ObfuscationFunction="SigningProfile_dGACRT7iNHV4" CleanserFunction="SigningProfile_dGACRT7iNHV4" ReIngestFunction="SigningProfile_dGACRT7iNHV4" AuthAccountMgmtEventProcessorFunction="SigningProfile_dGACRT7iNHV4" AuthOIDCEventProcessorFunction="SigningProfile_dGACRT7iNHV4" AppEventProcessorFunction="SigningProfile_dGACRT7iNHV4" IPVCIEventProcessorFunction="SigningProfile_dGACRT7iNHV4" --profile di-dev-event-processing-admin
echo "\x1b[32m sam package: complete \x1b[0m"

echo "\x1b[33m zip template: running \x1b[0m"
zip -FS "template.zip" "cf-template.yaml"
echo "\x1b[32m zip template: complete \x1b[0m"

echo "\x1b[33m s3 upload: running \x1b[0m"
aws s3 cp template.zip "s3://artifact-source-bucket-txma-ep-dev/template.zip" --profile di-dev-event-processing-admin
echo "\x1b[32m s3 complete: complete \x1b[0m"


echo "\x1b[32m Check AWS codepipeline using the event processing account/role \x1b[0m"
