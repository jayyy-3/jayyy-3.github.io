export function isPlaceholderValue(value) {
  return /<[^>]+>/.test(value) || /\[[^\]]+\]/.test(value);
}

export function isValidEmail(value) {
  return Boolean(value && !isPlaceholderValue(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export function normalizeBaseUrlOrigin(value, label = 'base URL') {
  if (!value) {
    throw new Error(`${label} requires a value.`);
  }

  if (isPlaceholderValue(value)) {
    throw new Error(`${label} must be a real http/https origin, not a placeholder.`);
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid http/https origin.`);
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`${label} must use http or https.`);
  }

  if ((url.pathname && url.pathname !== '/') || url.search || url.hash) {
    throw new Error(`${label} must be an origin only, with no path, query, or hash.`);
  }

  return url.origin;
}

export function isValidBaseUrlOrigin(value) {
  try {
    normalizeBaseUrlOrigin(value);
    return true;
  } catch {
    return false;
  }
}
