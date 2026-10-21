export type DetectedMediaFormat = {
  valid: boolean;
  kind?: 'image' | 'video' | 'audio';
  mimeType?: string;
  extension?: string;
  reason?: string;
};

export const DEFAULT_MAX_MEDIA_BYTES = 250 * 1024 * 1024;
export const DEFAULT_MAX_PROJECT_JSON_BYTES = 10 * 1024 * 1024;

export function validateSafeUri(uri: string): { safe: boolean; reason?: string } {
  if (typeof uri !== 'string' || uri.trim().length === 0) {
    return { safe: false, reason: 'URI cannot be empty.' };
  }
  if (uri.includes('\0')) {
    return { safe: false, reason: 'URI contains forbidden null byte.' };
  }
  const normalized = uri.replace(/\\/g, '/');
  const segments = normalized.split('/');
  if (segments.includes('..')) {
    return { safe: false, reason: 'Path traversal ("..") is not permitted.' };
  }
  return { safe: true };
}

export function verifyMediaMagicBytes(
  header: Uint8Array,
  filename = '',
  totalByteLength?: number,
  maxBytes = DEFAULT_MAX_MEDIA_BYTES
): DetectedMediaFormat {
  const size = totalByteLength ?? header.byteLength;
  if (size <= 0 || header.byteLength < 4) {
    return { valid: false, reason: 'File is empty or truncated (< 4 bytes).' };
  }
  if (size > maxBytes) {
    return {
      valid: false,
      reason: `File size (${size} bytes) exceeds maximum allowed limit (${maxBytes} bytes).`,
    };
  }

  if (
    header.byteLength >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return { valid: true, kind: 'image', mimeType: 'image/png', extension: 'png' };
  }

  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return { valid: true, kind: 'image', mimeType: 'image/jpeg', extension: 'jpg' };
  }

  if (
    header.byteLength >= 6 &&
    header[0] === 0x47 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x38 &&
    (header[4] === 0x37 || header[4] === 0x39) &&
    header[5] === 0x61
  ) {
    return { valid: true, kind: 'image', mimeType: 'image/gif', extension: 'gif' };
  }

  if (
    header.byteLength >= 12 &&
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46
  ) {
    const subType = String.fromCharCode(header[8], header[9], header[10], header[11]);
    if (subType === 'WEBP') {
      return { valid: true, kind: 'image', mimeType: 'image/webp', extension: 'webp' };
    }
    if (subType === 'WAVE') {
      return { valid: true, kind: 'audio', mimeType: 'audio/wav', extension: 'wav' };
    }
  }

  if (
    header.byteLength >= 12 &&
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  ) {
    const brand = String.fromCharCode(header[8], header[9], header[10], header[11]);
    const lowerName = filename.toLowerCase();
    if (brand === 'M4A ' || lowerName.endsWith('.m4a') || lowerName.endsWith('.aac')) {
      return { valid: true, kind: 'audio', mimeType: 'audio/mp4', extension: 'm4a' };
    }
    return { valid: true, kind: 'video', mimeType: 'video/mp4', extension: 'mp4' };
  }

  if (
    header.byteLength >= 4 &&
    header[0] === 0x4f &&
    header[1] === 0x67 &&
    header[2] === 0x67 &&
    header[3] === 0x53
  ) {
    return { valid: true, kind: 'audio', mimeType: 'audio/ogg', extension: 'ogg' };
  }

  if (
    (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) ||
    (header[0] === 0xff && (header[1] & 0xe0) === 0xe0)
  ) {
    return { valid: true, kind: 'audio', mimeType: 'audio/mpeg', extension: 'mp3' };
  }

  return {
    valid: false,
    reason: 'Unsupported or corrupted file signature (magic bytes did not match PNG, JPEG, WEBP, GIF, MP4, WAV, MP3, or OGG).',
  };
}

export function sanitizeLogMessage(message: string): string {
  if (typeof message !== 'string') return '';
  return message
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/(password|token|secret|api_key|apikey)\s*[:=]\s*[^\s&]+/gi, '$1=[REDACTED]')
    .replace(/\/home\/[^/\s]+/g, '/home/[USER]')
    .replace(/\/Users\/[^/\s]+/g, '/Users/[USER]');
}
