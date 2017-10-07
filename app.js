const express = require('express');
const cache = require('./cache.middleware');
const fetchHotels = require('./hotel.handler');
const app = express();

app.get('/hotels', cache.fetchFromCache, fetchHotels);

// default error handler
app.use((err, req, res, next) => {
  if (err) {
    const status = err.status || 400;
    return res.status(status).send({err: err.message});
  }
  return next();
});

const server = app.listen(3000, () => {
  console.log('Example app listening at port %s', server.address().port);
});
