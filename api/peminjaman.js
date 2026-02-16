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
      const rows = await query(
        `SELECT p.no, p.nim, p.nama, p.kode_alat, b.nama_alat, p.tgl_peminjaman, p.tgl_pengembalian, p.status
         FROM tbl_peminjaman p
         LEFT JOIN input_barang b ON b.kode_alat = p.kode_alat
         ORDER BY p.no DESC`
      );
      return res.end(JSON.stringify(rows));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { nim, nama, kode_alat, tgl_peminjaman } = body;

      await query(
        'INSERT INTO tbl_peminjaman (nim, nama, kode_alat, tgl_peminjaman, status) VALUES ($1, $2, $3, $4, $5)',
        [nim, nama, kode_alat, tgl_peminjaman, 'Belum Kembali']
      );
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'PUT') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      const body = await readBody(req);
      const { tgl_pengembalian, status } = body;
      const newStatus = status || 'Kembali';

      await query(
        'UPDATE tbl_peminjaman SET tgl_pengembalian = $1, status = $2 WHERE no = $3',
        [tgl_pengembalian, newStatus, id]
      );
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      await query('DELETE FROM tbl_peminjaman WHERE no = $1', [id]);
      return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
