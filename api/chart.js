const { getSupabase } = require('./_lib/supabase');
const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const auth = await requireAuth(req, res);
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
