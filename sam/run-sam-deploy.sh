#!/bin/bash

#Parameters
environment=${environment:-build}

while [ $# -gt 0 ]; do

   if [[ $1 == *"--"* ]]; then
        param="${1/--/}"

        if [[ ${param} == "environment" ]]; then
          case "$2" in

            build | staging | production | integration)
                echo "Environment is valid"
              ;;

            *)
                echo "unexpected environment name."
                echo "Please provide one of the following: "
                echo "build, staging, production, integration"

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

alias sam='sam.cmd'

##Currently we need to run these individually and manually take the AccountNumber of the Audit account and ARN for the SNS queue and use it in the respective toml files.
##Currently we are looking into using secrets manager to provide a means of sharing values between stacks in different accounts.

sam build --template-file event-processor-template.yml --config-file config/samconfig-ep.toml --config-env "$environment"
sam deploy --template-file event-processor-template.yml --config-file config/samconfig-ep.toml --config-env "$environment" --resolve-s3

#sam deploy --template-file audit-template.yml --config-file config/samconfig-audit.toml --config-env "$environment"

$SHELL