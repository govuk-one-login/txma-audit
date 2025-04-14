import { Readable } from 'stream'

export const readableToString = async (readable: Readable) => {
  const result = []

  for await (const chunk of readable) {
    result.push(Buffer.from(chunk))
  }

  return Buffer.concat(result).toString('utf-8')
}
