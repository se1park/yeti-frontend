const API_BASE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) || '';
const SESSION_KEY = 'yeti.auth.session';

let memorySession = null;

function getStorage() {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

function readToken(payload, key) {
  return payload?.[key] || payload?.data?.[key] || payload?.tokens?.[key] || payload?.data?.tokens?.[key] || null;
}

function normalizeSession(payload) {
  const accessToken = readToken(payload, 'accessToken') || readToken(payload, 'access_token');
  const refreshToken = readToken(payload, 'refreshToken') || readToken(payload, 'refresh_token');
  const user = payload?.user || payload?.data?.user || payload?.data || null;

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
    const message = payload?.message || payload?.error || `요청에 실패했습니다. (${response.status})`;
    if (typeof message === 'string' && message.length > 140) {
      throw new Error(`요청에 실패했습니다. (${response.status})`);
    }
    throw new Error(message);
  }

  return payload;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseResponse(response);
}

export function getApiBaseUrl() {
  return API_BASE_URL || '현재 도메인';
}

export async function saveSession(session) {
  memorySession = session;
  const storage = getStorage();
  if (storage) {
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export async function loadSession() {
  const storage = getStorage();
  if (!storage) return memorySession;

  const saved = storage.getItem(SESSION_KEY);
  if (!saved) return null;

  try {
    memorySession = JSON.parse(saved);
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
  return payload;
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
