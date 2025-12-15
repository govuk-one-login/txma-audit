#!/bin/bash

# Download processed CloudFormation template from deployed stack
# Usage: ./download_processed_template.sh <stack-name>

set -e

if [ $# -ne 1 ]; then
    echo "Usage: $0 <stack-name>"
    echo "Example: $0 audit"
    exit 1
fi

STACK_NAME=$1
OUTPUT_FILE="${STACK_NAME}-processed-template.json"

echo "Downloading processed template from stack: $STACK_NAME"

# Download the processed template (with all SAM transforms applied)
aws cloudformation get-template \
    --stack-name "$STACK_NAME" \
    --template-stage Processed \
    --query 'TemplateBody' \
    --output json > "$OUTPUT_FILE"

echo "✓ Processed template downloaded: $OUTPUT_FILE"

# Show file size
FILE_SIZE=$(wc -c < "$OUTPUT_FILE")
echo "Template size: $FILE_SIZE bytes"

if [ $FILE_SIZE -gt 460800 ]; then
    echo "⚠️  Warning: Template is larger than CloudFormation's 460KB limit"
fi

echo ""
echo "Now you can use it with the removal script:"
echo "python3 remove-resources-from-template.py $OUTPUT_FILE MessageBatchBucket"