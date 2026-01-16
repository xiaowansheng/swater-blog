export const encryptPasswordRsaOaep = async (publicKeyPem: string, plainText: string): Promise<string> => {
  const pemHeader = '-----BEGIN PUBLIC KEY-----'
  const pemFooter = '-----END PUBLIC KEY-----'
  const pemBody = publicKeyPem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s+/g, '')
  const binaryDerString = window.atob(pemBody)
  const binaryDer = new Uint8Array(binaryDerString.length)
  for (let i = 0; i < binaryDerString.length; i += 1) {
    binaryDer[i] = binaryDerString.charCodeAt(i)
  }

  const key = await window.crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  )

  const encoded = new TextEncoder().encode(plainText)
  const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoded)
  const encryptedBytes = new Uint8Array(encrypted)
  let binary = ''
  for (let i = 0; i < encryptedBytes.byteLength; i += 1) {
    binary += String.fromCharCode(encryptedBytes[i])
  }
  return window.btoa(binary)
}
