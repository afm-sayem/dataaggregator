const hash = require('object-hash');
const request = require('request-promise-native');
const endpoints = require('./endpoints.json');
const cache = require('./cache.middleware');

module.exports = async function fetchHotels(req, res, next) {
  try {
    // for each supplier, fetch the data. continue even if any source fails
    const suppliers = getSuppliers(req.query.suppliers);
    const aggregatedData = await Promise.all(suppliers.map((source) => request.get(source.url).catch(err => '{"error": true}')));
    const supplierData = formatData(aggregatedData);

    storeInCache(hash(req.query), supplierData);

    return res.status(200).send(supplierData);
  } catch(e) {
    console.log(e);
    return next(e);
  }
};

function getSuppliers(param) {
  // returns a list of suppliers that are defined in query parameters
  // if no supplier is defined then returns all suppliers
  return param ? param.split(',').map(name => endpoints.find(item => name === item.name)).filter(item => item): endpoints;
}

function formatData(aggregatedData) {
  // map the returned responses with suppliers
  const supplierData = aggregatedData.map((item, index) => {
    return {
      source: endpoints[index].name,
      contents: JSON.parse(item)
    };
  }).filter(item => !item.contents.error);

  // create an entry-price list for each supplier
  return supplierData.map(item => {
    return Object.entries(item.contents)
      .map(keyvalue => {
        return {
          id: keyvalue[0],
          supplier: item.source,
          price: keyvalue[1]
        };
      });
  }).reduce((a, b) => a.concat(b));
}

function storeInCache(key, value) {
  cache.cache.set(key, value);
}

