const { getSupabase } = require('./_lib/supabase');
const { requireAuth } = require('./_lib/auth');
const { readBody } = require('./_lib/parse-body');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const id = req.query && (req.query.no || req.query.id);
  const supabase = getSupabase();

  try {
    if (req.method === 'GET') {
      if (id) {
        const { data, error } = await supabase
          .from('input_barang')
          .select('*')
          .eq('no', id)
          .limit(1);
        if (error) throw error;
        return res.end(JSON.stringify((data && data[0]) || null));
      }
      const { data, error } = await supabase
        .from('input_barang')
        .select('*')
        .order('no', { ascending: false });
      if (error) throw error;
      return res.end(JSON.stringify(data || []));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { kd_alat, kategori, merek, nama_alat, spek, jml } = body;

      const { error } = await supabase.from('input_barang').insert({
        kode_alat: kd_alat,
        kategori,
        merek,
        nama_alat,
        spesifikasi: spek,
        jumlah: jml
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
      const { kd_alat, kategori, merek, nama_alat, spek, jml } = body;

      const { error } = await supabase
        .from('input_barang')
        .update({
          kode_alat: kd_alat,
          kategori,
          merek,
          nama_alat,
          spesifikasi: spek,
          jumlah: jml
        })
        .eq('no', id);
      if (error) throw error;
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      const { error } = await supabase.from('input_barang').delete().eq('no', id);
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
