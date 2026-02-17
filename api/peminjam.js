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
          .from('tbl_peminjam')
          .select('*')
          .eq('no', id)
          .limit(1);
        if (error) throw error;
        return res.end(JSON.stringify((data && data[0]) || null));
      }
      const { data, error } = await supabase
        .from('tbl_peminjam')
        .select('*')
        .order('no', { ascending: false });
      if (error) throw error;
      return res.end(JSON.stringify(data || []));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { nim, nama, prodi, telepon } = body;
      const { error } = await supabase.from('tbl_peminjam').insert({
        nim,
        nama,
        prodi,
        telepon
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
      const { nim, nama, prodi, telepon } = body;
      const { error } = await supabase
        .from('tbl_peminjam')
        .update({ nim, nama, prodi, telepon })
        .eq('no', id);
      if (error) throw error;
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      const { error } = await supabase.from('tbl_peminjam').delete().eq('no', id);
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
