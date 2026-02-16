const { query } = require('./_lib/db');
const { verify, getTokenFromReq } = require('./_lib/auth');
const { readBody } = require('./_lib/parse-body');

function requireAuth(req, res) {
  const token = getTokenFromReq(req);
  const payload = verify(token, process.env.AUTH_SECRET);
  if (!payload) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }
  return payload;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = req.query && (req.query.no || req.query.id);

  try {
    if (req.method === 'GET') {
      if (id) {
        const rows = await query('SELECT * FROM input_barang WHERE no = ? LIMIT 1', [id]);
        return res.end(JSON.stringify(rows[0] || null));
      }
      const rows = await query('SELECT * FROM input_barang ORDER BY no DESC');
      return res.end(JSON.stringify(rows));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { kd_alat, kategori, merek, nama_alat, spek, jml } = body;

      await query(
        'INSERT INTO input_barang (kode_alat, kategori, merek, nama_alat, spesifikasi, jumlah) VALUES (?, ?, ?, ?, ?, ?)',
        [kd_alat, kategori, merek, nama_alat, spek, jml]
      );
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'PUT') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      const body = await readBody(req);
      const { kd_alat, kategori, merek, nama_alat, spek, jml } = body;

      await query(
        'UPDATE input_barang SET kode_alat = ?, kategori = ?, merek = ?, nama_alat = ?, spesifikasi = ?, jumlah = ? WHERE no = ?',
        [kd_alat, kategori, merek, nama_alat, spek, jml, id]
      );
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      await query('DELETE FROM input_barang WHERE no = ?', [id]);
      return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
