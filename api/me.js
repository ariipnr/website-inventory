const { verify, getTokenFromReq } = require('./_lib/auth');

module.exports = async (req, res) => {
  const token = getTokenFromReq(req);
  const payload = verify(token, process.env.AUTH_SECRET);
  if (!payload) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ username: payload.username }));
};
