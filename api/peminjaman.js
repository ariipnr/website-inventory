const { getSupabase } = require('./_lib/supabase');
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
  const supabase = getSupabase();

  try {
    if (req.method === 'GET') {
      const { data: peminjaman, error } = await supabase
        .from('tbl_peminjaman')
        .select('no, nim, nama, kode_alat, tgl_peminjaman, tgl_pengembalian, status')
        .order('no', { ascending: false });
      if (error) throw error;

      const kodeList = Array.from(
        new Set((peminjaman || []).map((row) => row.kode_alat).filter(Boolean))
      );
      let namaMap = {};
      if (kodeList.length) {
        const { data: barang, error: barangError } = await supabase
          .from('input_barang')
          .select('kode_alat, nama_alat')
          .in('kode_alat', kodeList);
        if (barangError) throw barangError;
        namaMap = (barang || []).reduce((acc, row) => {
          acc[row.kode_alat] = row.nama_alat;
          return acc;
        }, {});
      }

      const rows = (peminjaman || []).map((row) => ({
        ...row,
        nama_alat: namaMap[row.kode_alat] || null
      }));
      return res.end(JSON.stringify(rows));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { nim, nama, kode_alat, tgl_peminjaman } = body;

      const { error } = await supabase.from('tbl_peminjaman').insert({
        nim,
        nama,
        kode_alat,
        tgl_peminjaman,
        status: 'Belum Kembali'
      });
      if (error) throw error;
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

      const { error } = await supabase
        .from('tbl_peminjaman')
        .update({ tgl_pengembalian, status: newStatus })
        .eq('no', id);
      if (error) throw error;
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      const { error } = await supabase.from('tbl_peminjaman').delete().eq('no', id);
      if (error) throw error;
      return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
