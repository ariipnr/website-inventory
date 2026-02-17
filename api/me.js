const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ username: user.email }));
};
