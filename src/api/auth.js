const API_BASE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) || '';
const SESSION_KEY = 'yeti.auth.session';
const PROFILE_CACHE_KEY = 'yeti.auth.profileCache';

let memorySession = null;

function getStorage() {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

function readToken(payload, key) {
  return (
    payload?.[key]
    || payload?.data?.[key]
    || payload?.result?.[key]
    || payload?.tokens?.[key]
    || payload?.data?.tokens?.[key]
    || payload?.result?.tokens?.[key]
    || null
  );
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const [, body] = token.split('.');
  if (!body) return null;

  try {
    const normalized = body.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = typeof atob === 'function'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isAccessTokenExpiring(token, skewSeconds = 90) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

function hasUserIdentity(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Boolean(
    value.id
    || value.userId
    || value.email
    || value.username
    || value.userName
    || value.nickname
    || value.nickName
    || value.name
    || value.displayName
    || value.display_name
    || value.handle
    || value.sub
  );
}

function readFirstString(source, keys) {
  if (!source || typeof source !== 'object') return '';

  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === 'object') {
      const nested = readFirstString(value, keys);
      if (nested) return nested;
    }
  }

  return '';
}

function normalizeUser(value) {
  if (!value || typeof value !== 'object') return {};

  const nickname = readFirstString(value, ['nickname', 'nickName', 'displayName', 'display_name']);
  const username = readFirstString(value, ['username', 'userName', 'preferred_username', 'handle']);
  const email = readFirstString(value, ['email', 'emailAddress', 'mail']);
  const name = readFirstString(value, ['name', 'realName', 'fullName']);
  const id = readFirstString(value, ['id', 'userId', 'memberId', 'sub']);

  return {
    ...value,
    ...(id ? { id } : {}),
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
    ...(username ? { username } : {}),
    ...(nickname ? { nickname } : {}),
  };
}

function getUserCacheKey(user) {
  const normalized = normalizeUser(user);
  return normalized.id || normalized.userId || normalized.sub || normalized.email || '';
}

function readProfileCache() {
  const storage = getStorage();
  if (!storage) return {};

  try {
    return JSON.parse(storage.getItem(PROFILE_CACHE_KEY) || '{}');
  } catch {
    storage.removeItem(PROFILE_CACHE_KEY);
    return {};
  }
}

function getCachedProfile(user) {
  const key = getUserCacheKey(user);
  if (!key) return {};
  return normalizeUser(readProfileCache()[key]);
}

function saveCachedProfile(user) {
  const normalized = normalizeUser(user);
  const key = getUserCacheKey(normalized);
  if (!key || (!normalized.username && !normalized.nickname)) return;

  const storage = getStorage();
  if (!storage) return;

  const cache = readProfileCache();
  cache[key] = {
    ...(cache[key] || {}),
    ...normalized,
  };
  storage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
}

function readUser(payload, tokenClaims) {
  const candidates = [
    payload?.user,
    payload?.data?.user,
    payload?.result?.user,
    payload?.profile,
    payload?.data?.profile,
    payload?.result?.profile,
    payload?.member,
    payload?.data?.member,
    payload?.result?.member,
    payload?.account,
    payload?.data?.account,
    payload?.result?.account,
    payload,
    payload?.data,
    payload?.result,
  ];
  const responseUser = candidates.find(hasUserIdentity) || {};
  const normalizedClaims = normalizeUser(tokenClaims);
  const normalizedResponseUser = normalizeUser(responseUser);
  const mergedUser = { ...normalizedClaims, ...normalizedResponseUser };
  const cachedProfile = getCachedProfile(mergedUser);

  return hasUserIdentity(normalizedResponseUser) || hasUserIdentity(normalizedClaims)
    ? { ...mergedUser, ...cachedProfile }
    : null;
}

function normalizeSession(payload) {
  const accessToken = readToken(payload, 'accessToken') || readToken(payload, 'access_token') || readToken(payload, 'token') || readToken(payload, 'jwt');
  const refreshToken = readToken(payload, 'refreshToken') || readToken(payload, 'refresh_token');
  const tokenClaims = decodeJwtPayload(accessToken);
  const user = readUser(payload, tokenClaims);

  return {
    accessToken,
    refreshToken,
    newUser: Boolean(payload?.newUser ?? payload?.data?.newUser),
    plan: payload?.plan || payload?.data?.plan || null,
    user,
    raw: payload,
  };
}

async function parseResponse(response) {
  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text || `응답을 해석할 수 없습니다. (${response.status})` };
  }

  if (!response.ok) {
    const fallbackMessage = response.status === 401
      ? `로그인이 만료되었습니다. 다시 로그인해주세요. (${response.status})`
      : response.status === 403
        ? `요청 권한이 없거나 아직 사용할 수 없는 기능입니다. (${response.status})`
      : `요청에 실패했습니다. (${response.status})`;
    const message = payload?.message || payload?.error || fallbackMessage;
    if (typeof message === 'string' && message.length > 140) {
      throw new Error(`요청에 실패했습니다. (${response.status})`);
    }
    throw new Error(message);
  }

  return payload;
}

export async function request(path, { method = 'GET', body, token, query } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const search = query
    ? `?${Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')}`
    : '';

  const response = await fetch(`${API_BASE_URL}${path}${search}`, {
    method,
    headers,
    mode: 'cors',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseResponse(response);
}

export function getApiBaseUrl() {
  return API_BASE_URL || '현재 도메인';
}

export async function saveSession(session) {
  const normalizedUser = normalizeUser(session?.user);
  const nextSession = session ? { ...session, user: normalizedUser } : session;
  saveCachedProfile(normalizedUser);
  memorySession = nextSession;
  const storage = getStorage();
  if (storage) {
    storage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  }
}

export async function loadSession() {
  const storage = getStorage();
  if (!storage) return memorySession;

  const saved = storage.getItem(SESSION_KEY);
  if (!saved) return null;

  try {
    memorySession = JSON.parse(saved);
    if (memorySession) {
      const tokenClaims = decodeJwtPayload(memorySession.accessToken);
      const normalizedUser = normalizeUser(memorySession.user);
      memorySession.user = readUser(memorySession.raw, tokenClaims) || { ...normalizedUser, ...getCachedProfile(normalizedUser) };
    }
    return memorySession;
  } catch {
    storage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function clearSession() {
  memorySession = null;
  const storage = getStorage();
  storage?.removeItem(SESSION_KEY);
}

export async function signup(body) {
  const payload = await request('/api/auth/signup', { method: 'POST', body });
  return normalizeSession(payload);
}

export async function login(body) {
  const payload = await request('/api/auth/login', { method: 'POST', body });
  return normalizeSession(payload);
}

export async function oauthLogin(provider, token) {
  const payload = await request(`/api/auth/oauth2/${provider}`, {
    method: 'POST',
    body: { token },
  });
  return normalizeSession(payload);
}

export async function completeOnboarding(body, accessToken) {
  const payload = await request('/api/auth/onboarding', {
    method: 'POST',
    body,
    token: accessToken,
  });
  return {
    payload,
    user: readUser(payload, null) || normalizeUser(body),
  };
}

export async function refresh(refreshToken) {
  const payload = await request('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
  return normalizeSession(payload);
}

export async function getPlan(accessToken) {
  return request('/api/auth/plan', {
    method: 'GET',
    token: accessToken,
  });
}

export async function logout(refreshToken) {
  return request('/api/auth/logout', {
    method: 'DELETE',
    body: { refreshToken },
  });
}
