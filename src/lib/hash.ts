/**
 * Computes SHA-256 hash of an ArrayBuffer or string
 */
export async function computeHash(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let buffer: ArrayBuffer;

  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const copy = new Uint8Array(encoded.byteLength);
    copy.set(encoded);
    buffer = copy.buffer;
  } else if (data instanceof Uint8Array) {
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    buffer = copy.buffer;
  } else {
    buffer = data;
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple checksum if crypto.subtle is unavailable
  let hash = 0;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i];
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}
