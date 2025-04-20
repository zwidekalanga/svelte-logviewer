#!/bin/bash

# This script triggers the release process using the repository_dispatch event
# It requires a GitHub personal access token with the repo scope

# Check if the GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set"
  echo "Please set it to a GitHub personal access token with the repo scope"
  echo "Example: export GITHUB_TOKEN=your_token_here"
  exit 1
fi

# Default values
REPO_OWNER="zwidekalanga"
REPO_NAME="svelte-logviewer"
PUBLISH_TO_NPM=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --publish)
      PUBLISH_TO_NPM=true
      shift
      ;;
    --owner)
      REPO_OWNER="$2"
      shift
      shift
      ;;
    --repo)
      REPO_NAME="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--publish] [--owner OWNER] [--repo REPO]"
      exit 1
      ;;
  esac
done

# Construct the payload
PAYLOAD="{\"event_type\": \"trigger-release\", \"client_payload\": {\"publish_to_npm\": $PUBLISH_TO_NPM}}"

# Trigger the repository_dispatch event
echo "Triggering release process for $REPO_OWNER/$REPO_NAME"
echo "Publish to npm: $PUBLISH_TO_NPM"

curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "$PAYLOAD" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches"

echo "Release process triggered successfully"