const { getSupabase } = require('./_lib/supabase');
const { verify, getTokenFromReq } = require('./_lib/auth');

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

  try {
    const supabase = getSupabase();
    const { data: barang, error } = await supabase
      .from('input_barang')
      .select('kategori');
    if (error) throw error;

    const categories = [
      'Network Device',
      'Sparepart',
      'Alat',
      'Printer',
      'PC',
      'Lainnya'
    ];

    const map = {};
    (barang || []).forEach((row) => {
      const key = row.kategori || 'Lainnya';
      map[key] = (map[key] || 0) + 1;
    });
    const data = categories.map((c) => ({ kategori: c, jumlah: map[c] || 0 }));

    res.end(JSON.stringify({ data }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
