#!/bin/bash

set -e  # Exit on any error

# Restore backup objects from restored bucket to original bucket
# Usage: ./restore-backup-objects.sh <restored-bucket-name> <original-bucket-name> [aws-profile] [optional-prefix]

RESTORED_BUCKET="$1"
ORIGINAL_BUCKET="$2"
AWS_PROFILE="${3:-default}"
PREFIX="$4"

if [ -z "$RESTORED_BUCKET" ] || [ -z "$ORIGINAL_BUCKET" ]; then
    echo "Usage: $0 <restored-bucket-name> <original-bucket-name> [aws-profile] [optional-prefix]"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    echo "Error: AWS credentials not configured for profile $AWS_PROFILE"
    exit 1
fi

echo "Restoring from $RESTORED_BUCKET to $ORIGINAL_BUCKET"
echo "Using AWS profile: $AWS_PROFILE"

# Restore objects with pagination
echo "Starting object restoration from $RESTORED_BUCKET to $ORIGINAL_BUCKET..."
if [ -n "$PREFIX" ]; then
    echo "Using prefix filter: $PREFIX"
else
    echo "No prefix filter (processing all objects)"
fi

NEXT_TOKEN=""
OBJECT_COUNT=0

while true; do
    if [ -z "$NEXT_TOKEN" ]; then
        if [ -n "$PREFIX" ]; then
            RESPONSE=$(aws s3api list-objects-v2 \
                --bucket "$RESTORED_BUCKET" \
                --prefix "$PREFIX" \
                --query "{Contents: Contents[].Key, NextContinuationToken: NextContinuationToken}" \
                --output json --profile "$AWS_PROFILE")
        else
            RESPONSE=$(aws s3api list-objects-v2 \
                --bucket "$RESTORED_BUCKET" \
                --query "{Contents: Contents[].Key, NextContinuationToken: NextContinuationToken}" \
                --output json --profile "$AWS_PROFILE")
        fi
    else
        if [ -n "$PREFIX" ]; then
            RESPONSE=$(aws s3api list-objects-v2 \
                --bucket "$RESTORED_BUCKET" \
                --prefix "$PREFIX" \
                --continuation-token "$NEXT_TOKEN" \
                --query "{Contents: Contents[].Key, NextContinuationToken: NextContinuationToken}" \
                --output json --profile "$AWS_PROFILE")
        else
            RESPONSE=$(aws s3api list-objects-v2 \
                --bucket "$RESTORED_BUCKET" \
                --continuation-token "$NEXT_TOKEN" \
                --query "{Contents: Contents[].Key, NextContinuationToken: NextContinuationToken}" \
                --output json --profile "$AWS_PROFILE")
        fi
    fi
    
    if [ $? -ne 0 ]; then
        echo "Error listing objects. Exiting."
        exit 1
    fi
    
    # Extract objects and copy them
    OBJECTS=$(echo "$RESPONSE" | jq -r '.Contents[]? // empty')
    if [ -n "$OBJECTS" ]; then
        BATCH_COUNT=0
        while IFS= read -r key; do
            if [ -n "$key" ]; then
                # Copy object preserving metadata
                aws s3 cp "s3://$RESTORED_BUCKET/$key" "s3://$ORIGINAL_BUCKET/$key" \
                    --profile "$AWS_PROFILE" \
                    --storage-class STANDARD \
                    --metadata-directive COPY
                
                BATCH_COUNT=$((BATCH_COUNT + 1))
                
                # Progress indicator
                if [ $((BATCH_COUNT % 100)) -eq 0 ]; then
                    echo "Copied $BATCH_COUNT objects in current batch..."
                fi
            fi
        done <<< "$OBJECTS"
        
        OBJECT_COUNT=$((OBJECT_COUNT + BATCH_COUNT))
        echo "Processed batch: $BATCH_COUNT objects (total: $OBJECT_COUNT)"
    fi
    
    # Check for next token
    NEXT_TOKEN=$(echo "$RESPONSE" | jq -r '.NextContinuationToken // empty')
    if [ -z "$NEXT_TOKEN" ]; then
        break
    fi
    
    echo "Continuing with next page..."
done

echo "Restoration completed. Total objects copied: $OBJECT_COUNT"
echo "Verify with: aws s3 ls s3://$ORIGINAL_BUCKET --recursive --summarize --profile $AWS_PROFILE"