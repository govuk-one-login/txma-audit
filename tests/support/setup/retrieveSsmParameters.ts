import {
  GetParametersByPathCommand,
  Parameter,
  SSMClient
} from '@aws-sdk/client-ssm'

/**
 * Retrieves all SSM parameters under a given path, transparently following
 * pagination via NextToken. The SSM client is injected to keep this testable.
 */
export const getAllParametersByPath = async (
  client: SSMClient,
  path: string
): Promise<Parameter[]> => {
  const parameters: Parameter[] = []
  let nextToken: string | undefined

  do {
    const response = await client.send(
      new GetParametersByPathCommand({
        Path: path,
        Recursive: false,
        NextToken: nextToken
      })
    )

    if (response.Parameters) {
      parameters.push(...response.Parameters)
    }

    nextToken = response.NextToken
  } while (nextToken)

  return parameters
}
