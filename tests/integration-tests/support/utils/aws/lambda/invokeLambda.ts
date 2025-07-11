import { getEnv } from '../../../../../../common/utils/helpers/getEnv'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { TextEncoder, TextDecoder } from 'node:util'

export const invokeLambdaFunction = async (
  functionName: string,
  payload: unknown
) => {
  const client = new LambdaClient({ region: getEnv('AWS_REGION') })
  const input = {
    FunctionName: functionName,
    Payload: jsonToUint8Array(payload)
  }
  try {
    const result = await client.send(new InvokeCommand(input))
    return uint8ArrayToJson(result.Payload)
  } catch (error) {
    console.log('error', error)
  }
}

const jsonToUint8Array = (json: unknown): Uint8Array => {
  let jsonStr: string
  try {
    jsonStr = JSON.stringify(json)
    JSON.parse(jsonStr) // Ensure the JSON is valid!!
  } catch {
    throw new Error('Invalid JSON payload')
  }
  const encoder = new TextEncoder()
  return encoder.encode(jsonStr)
}

const uint8ArrayToJson = (binArray: Uint8Array | undefined): unknown => {
  if (!binArray) return {}

  const decoder = new TextDecoder()
  const jsonString = decoder.decode(binArray)

  return JSON.parse(jsonString)
}
