const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let normalized = url.trim().toLowerCase();

  normalized = normalized.replace(/^https?:\/\//, '');
  normalized = normalized.replace(/^www\./, '');
  normalized = normalized.replace(/\/+$/, '');
  normalized = normalized.replace(/\?.*$/, '');
  normalized = normalized.replace(/#.*$/, '');

  return normalized;
};

const extractDomain = (url) => {
  const normalized = normalizeUrl(url);
  const parts = normalized.split('/');
  return parts[0];
};

const isSameUrl = (url1, url2) => {
  return normalizeUrl(url1) === normalizeUrl(url2);
};

const isSameDomain = (url1, url2) => {
  return extractDomain(url1) === extractDomain(url2);
};

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlPattern.test(url.trim());
};

const addProtocol = (url) => {
  if (!url) return '';
  
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
};

export {
  normalizeUrl,
  extractDomain,
  isSameUrl,
  isSameDomain,
  isValidUrl,
  addProtocol,
};

export default {
  normalizeUrl,
  extractDomain,
  isSameUrl,
  isSameDomain,
  isValidUrl,
  addProtocol,
};
