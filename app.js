function getToken() {
  return window.localStorage.getItem('token');
}

function setToken(token) {
  window.localStorage.setItem('token', token);
}

function clearToken() {
  window.localStorage.removeItem('token');
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html?pesan=belum_login';
  }
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    if (!window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html?pesan=belum_login';
    }
  }
  return res;
}

async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message = data && data.error ? data.error : 'Terjadi kesalahan';
    throw new Error(message);
  }
  return data;
}

function logout() {
  clearToken();
  window.location.href = 'login.html?pesan=logout';
}

window.app = {
  getToken,
  setToken,
  clearToken,
  getQueryParam,
  requireAuth,
  apiFetch,
  apiJson,
  logout
};
