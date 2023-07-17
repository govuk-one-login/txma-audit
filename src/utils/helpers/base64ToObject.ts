export const base64ToObject = (base64String: string) =>
  JSON.parse(Buffer.from(base64String, 'base64').toString('utf-8'))
