module.exports = async (req, res) => {
  res.statusCode = 410;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      error: 'Login endpoint deprecated. Use Supabase Auth from the frontend.'
    })
  );
};
