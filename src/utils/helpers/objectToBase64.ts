export const objectToBase64 = (object: object) =>
  Buffer.from(JSON.stringify(object)).toString('base64')
