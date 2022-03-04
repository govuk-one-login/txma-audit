#!/bin/bash

#Parameters
environment=${environment:-build}
profile=${school:-di-dev-admin}

while [ $# -gt 0 ]; do

   if [[ $1 == *"--"* ]]; then
        param="${1/--/}"

        if [[ ${param} == "environment" ]]; then
          case "$2" in

            build | staging | production)
                echo "Environment is valid"
              ;;

            *)
                echo "unexpected environment name."
                echo "Please provide one of the following: "
                echo "build, staging, production"

                exit 1
              ;;
          esac
        fi

        param="${1/--/}"

        declare "$param"="$2"
   fi

  shift
done

echo "Environment: $environment";
echo "profile: $profile";

alias sam='sam.cmd'

sam deploy -t event-processor-template.yml --parameter-overrides Environment="$environment" --profile "$profile" --stack-name "di-txma-ep-${environment}" --region "eu-west-2"

sam deploy -t audit-template.yml --parameter-overrides Environment="$environment" EventProcessorStackName="di-txma-ep-${environment}" --profile "$profile" --stack-name "di-txma-audit-${environment}" --region "eu-west-2" --capabilities CAPABILITY_IAM

$SHELL