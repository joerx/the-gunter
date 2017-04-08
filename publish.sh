#!/bin/sh

set -e # dick mode

node -c bot.js

# import user creds if present
test -f .credentials && source .credentials

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION

# create zip archive
rm -f export.zip
find . -path '*/.git' -prune -o -type f -print | zip ./export.zip -@

# push latest version
aws lambda update-function-code \
    --function-name TheGunterFn \
    --zip-file fileb://./export.zip \
    --publish

# set up environment
aws lambda update-function-configuration \
    --function-name TheGunterFn \
    --environment Variables="{FB_VERIFY_TOKEN=$FB_VERIFY_TOKEN,FB_PAGE_TOKEN=$FB_PAGE_TOKEN}"

# do not use $LATEST to avoid accidental overrides via lambda inline editor
aws lambda update-alias \
    --name edge \
    --function-name TheGunterFn \
    --function-version '$LATEST'
