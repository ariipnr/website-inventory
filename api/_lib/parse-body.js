async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      const contentType = req.headers['content-type'] || '';
      try {
        if (contentType.includes('application/json')) {
          return resolve(JSON.parse(data));
        }
        if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(data);
          const obj = {};
          for (const [key, value] of params.entries()) obj[key] = value;
          return resolve(obj);
        }
        return resolve({ raw: data });
      } catch (err) {
        return reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = { readBody };
