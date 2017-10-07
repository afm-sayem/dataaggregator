const NodeCache = require('node-cache');
const hash = require('object-hash');

const cache = new NodeCache(5 * 60 * 1000);

function fetchFromCache(req, res, next) {
  const key = hash(req.query);
  const dataFromCache = cache.get(key);

  if (dataFromCache) {
    console.log('cache hit');
    return res.send(dataFromCache);
  } else {
    console.log('cache miss');
    return next();
  }
}

module.exports = {cache, fetchFromCache};
