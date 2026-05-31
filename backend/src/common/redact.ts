const SENSITIVE_KEYS = [
  'senha',
  'password',
  'password_hash',
  'token',
  'authorization',
  'secret',
];

const MAX_BODY_LENGTH = 500;

function isSensitive(key: string): boolean {
  return SENSITIVE_KEYS.includes(key.toLowerCase());
}

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) =>
        isSensitive(key) ? [key, '***'] : [key, redact(val)],
      ),
    );
  }
  return value;
}

export function formatBody(body: unknown): string {
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return '';
  }
  const json = JSON.stringify(redact(body));
  const safe =
    json.length > MAX_BODY_LENGTH ? `${json.slice(0, MAX_BODY_LENGTH)}…` : json;
  return ` | body=${safe}`;
}
