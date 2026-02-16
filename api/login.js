const { query } = require('./_lib/db');
const { sign } = require('./_lib/auth');
const { readBody } = require('./_lib/parse-body');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const body = await readBody(req);
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    if (!username || !password) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Username dan password wajib diisi' }));
    }

    const rows = await query(
      'SELECT username FROM tbl_login WHERE username = ? AND password = ? LIMIT 1',
      [username, password]
    );

    if (!rows || rows.length === 0) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Username atau password salah' }));
    }

    const token = sign({ username }, process.env.AUTH_SECRET);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ token, username }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
