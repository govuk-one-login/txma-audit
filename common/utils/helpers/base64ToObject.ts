export const base64ToObject = (base64String: string): unknown =>
  JSON.parse(Buffer.from(base64String, 'base64').toString('utf-8'))
