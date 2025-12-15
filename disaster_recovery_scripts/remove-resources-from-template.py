#!/usr/bin/env python3

import json
import sys

# CloudFormation intrinsic function constants
FN_GET_ATT = 'Fn::GetAtt'
FN_REF = 'Ref'
FN_SUB = 'Fn::Sub'
RESOURCE = 'Resource'
DEPENDS_ON = 'DependsOn'
RESOURCES = 'Resources'
OUTPUTS = 'Outputs'
VALUE = 'Value'

# Predefined resource groups for common bucket removal scenarios
RESOURCE_GROUPS = {
    'MessageBatchBucket': [
        'MessageBatchBucket', 'MessageBatchBucketPolicy',
        'AuditMessageFirehoseProcessingFailureAlarm', 'NoAuditMessagesReceivedAlarm',
        'AuditMessageDeliveryStream', 'AuditFirehoseDeliverySuccessPercentage',
        'AuditFirehoseDeliveryFreshness', 'AuditMessageDeliveryStreamSubscriptionDeadLetterQueuePolicy',
        'AuditMessageDeliveryStreamSubscription'
    ],
    'PermanentMessageBatchBucket': [
        'PermanentMessageBatchBucket'
    ]
}


def remove_resources_from_template(template_file, resources_to_remove, output_suffix):
    """Remove specified resources and related dependencies from CloudFormation template"""

    with open(template_file, 'r') as f:
        template = json.load(f)

    print(f"Processing template: {template_file}")
    print(f"Looking for resources to remove: {resources_to_remove}")

    # Remove the resources
    if RESOURCES in template:
        for resource in resources_to_remove:
            if resource in template[RESOURCES]:
                del template[RESOURCES][resource]
                print(f"Removed resource: {resource}")

    # Remove DependsOn references
    if RESOURCES in template:
        for resource_name, resource_config in template[RESOURCES].items():
            if DEPENDS_ON in resource_config:
                depends_on = resource_config[DEPENDS_ON]
                if isinstance(depends_on, list):
                    # Remove from list
                    resource_config[DEPENDS_ON] = [dep for dep in depends_on if dep not in resources_to_remove]
                    # Remove DependsOn if empty
                    if not resource_config[DEPENDS_ON]:
                        del resource_config[DEPENDS_ON]
                elif depends_on in resources_to_remove:
                    # Remove single dependency
                    del resource_config[DEPENDS_ON]

    # Remove outputs that reference the resources
    if OUTPUTS in template:
        outputs_to_remove = []
        for output_name, output_config in template[OUTPUTS].items():
            if VALUE in output_config and FN_REF in output_config[VALUE]:
                if output_config[VALUE][FN_REF] in resources_to_remove:
                    outputs_to_remove.append(output_name)

        for output in outputs_to_remove:
            del template[OUTPUTS][output]
            print(f"Removed output: {output}")

    # Remove references in other resources (CloudFormation intrinsic functions)
    def clean_references(obj, removed_resources):
        if isinstance(obj, dict):
            """
            Handle Fn::GetAtt references - gets attributes from resources (e.g., bucket ARN, domain name)
            Format: {"Fn::GetAtt": ["ResourceName", "AttributeName"]}
            Example: {"Fn::GetAtt": ["MyBucket", "Arn"]} gets the ARN of MyBucket
            """
            if FN_GET_ATT in obj and isinstance(obj[FN_GET_ATT], list):
                if obj[FN_GET_ATT][0] in removed_resources:
                    return None  # Remove the entire property

            """
            Handle Ref references - gets the physical ID or name of a resource
            Format: {"Ref": "ResourceName"}
            Example: {"Ref": "MyBucket"} returns the bucket name
            """
            if FN_REF in obj and obj[FN_REF] in removed_resources:
                return None  # Remove the entire property

            """
            Handle Fn::Sub references - substitutes variables in strings
            Format: {"Fn::Sub": "String with ${ResourceName} variables"}
            Example: {"Fn::Sub": "arn:aws:s3:::${MyBucket}/*"} substitutes bucket name
            """
            if FN_SUB in obj and isinstance(obj[FN_SUB], str):
                for removed_resource in removed_resources:
                    if f'${{{removed_resource}' in obj[FN_SUB]:
                        return None  # Remove the entire property

            # Handle Resource references in arrays
            if RESOURCE in obj and isinstance(obj[RESOURCE], list):
                obj[RESOURCE] = [res for res in obj[RESOURCE]
                                   if not any(removed_resource in str(res) for removed_resource in removed_resources)]
                if not obj[RESOURCE]:  # If empty, remove the whole statement
                    return None

            # Recursively clean nested objects
            cleaned = {}
            for key, value in obj.items():
                cleaned_value = clean_references(value, removed_resources)
                if cleaned_value is not None:
                    cleaned[key] = cleaned_value
            return cleaned

        elif isinstance(obj, list):
            cleaned_list = []
            for item in obj:
                cleaned_item = clean_references(item, removed_resources)
                if cleaned_item is not None:
                    cleaned_list.append(cleaned_item)
            return cleaned_list

        return obj

    # Clean all resources
    if RESOURCES in template:
        template[RESOURCES] = clean_references(template[RESOURCES], resources_to_remove)

    # Save modified template
    output_file = template_file.replace('.json', f'-{output_suffix}.json')
    with open(output_file, 'w') as f:
        json.dump(template, f, indent=2)

    print(f"Modified template saved as: {output_file}")


def main():
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python3 remove-resources-from-template.py <template-file.json> <bucket-name>")
        print("  python3 remove-resources-from-template.py <template-file.json> custom <resource1> <resource2> ...")
        print("")
        print("Available bucket names:")
        for bucket in RESOURCE_GROUPS.keys():
            print(f"  - {bucket}")
        print("")
        print("Examples:")
        print("  python3 remove-resources-from-template.py template.json MessageBatchBucket")
        print("  python3 remove-resources-from-template.py template.json PermanentMessageBatchBucket")
        print("  python3 remove-resources-from-template.py template.json custom MyBucket MyBucketPolicy")
        sys.exit(1)

    template_file = sys.argv[1]
    bucket_or_mode = sys.argv[2]

    if bucket_or_mode == 'custom':
        # Custom resource list
        if len(sys.argv) < 4:
            print("Error: Custom mode requires at least one resource name")
            sys.exit(1)
        resources_to_remove = sys.argv[3:]
        output_suffix = 'no-custom-resources'
    elif bucket_or_mode in RESOURCE_GROUPS:
        # Predefined bucket group
        resources_to_remove = RESOURCE_GROUPS[bucket_or_mode]
        bucket_name = bucket_or_mode.lower().replace('messagebatchbucket', 'bucket')
        output_suffix = f'no-{bucket_name}'
    else:
        print(f"Error: Unknown bucket name '{bucket_or_mode}'")
        print("Available options:", list(RESOURCE_GROUPS.keys()))
        sys.exit(1)

    remove_resources_from_template(template_file, resources_to_remove, output_suffix)


if __name__ == "__main__":
    main()
