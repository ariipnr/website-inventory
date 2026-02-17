function getToken() {
  return window.localStorage.getItem('token');
}

function setToken(token) {
  window.localStorage.setItem('token', token);
}

function clearToken() {
  window.localStorage.removeItem('token');
}

let supabaseClient;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase) return null;
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return null;
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return supabaseClient;
}

async function ensureToken() {
  let token = getToken();
  if (!token) {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client.auth.getSession();
      token = data && data.session ? data.session.access_token : null;
      if (token) setToken(token);
    }
  }
  return token;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function requireAuth() {
  const token = await ensureToken();
  if (!token) {
    window.location.href = 'login.html?pesan=belum_login';
  }
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = await ensureToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html?pesan=belum_login';
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
  const client = getSupabaseClient();
  if (client) {
    client.auth.signOut();
  }
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
