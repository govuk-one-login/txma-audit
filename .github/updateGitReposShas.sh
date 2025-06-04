#!/bin/sh

# This will search the git workflows for references to github repositories and fetch the latest tag information
# printing repo name, commit sha, and tag name in a line that can be copied into the github action.
# My aim was to see if the script could edit the file automatically but I ran out of steam.

# You will need to create a personal auth token in github and pass it as the env variable `GITHUB_TOKEN`


if [ -z "$GITHUB_TOKEN"]
then
  echo "\$GITHUB_TOKEN is not defined."
  exit -1
fi

repos=`grep uses workflows/*.yaml | awk '{print $3}' | awk -F '@' '{print $1}'`


doRepo () {
	allTags=$(curl -s --request GET --url https://api.github.com/repos/$1/tags --header "Authorization: Bearer ${GITHUB_TOKEN}" --header "X-GitHub-Api-Version: 2022-11-28" | jq -r '.[0]')
#	echo $allTags
	tagName=$(jq -r '.name' <<< "$allTags")
	tagSha=$(jq -r '.commit.sha' <<< "$allTags")
	echo "${1}@${tagSha} # ${tagName}"
}

for repo in  $repos; do
  doRepo $repo
done




#doRepo 'actions/checkout'
