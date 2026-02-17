const { getSupabase } = require('./supabase');

function getTokenFromReq(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function requireAuth(req, res) {
  const token = getTokenFromReq(req);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }
  return data.user;
}

module.exports = { getTokenFromReq, requireAuth };
