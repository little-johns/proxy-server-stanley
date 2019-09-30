require('newrelic');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const redis = require('redis');
const { client } = require('./redis.js');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use('/:query', express.static(path.join(__dirname, './public')));

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
}

app.get('/id/:query', (req, res) => {

  client.get(req.params.query, (error, result) => {
    if (error) {
        console.log(error);
        throw error;
    }
    if (result === null) {
      axios.get(`http://localhost:5000/id/${req.params.query}`)
        .then((response) => {
        client.set(req.params.query, JSON.stringify(response.data))
        console.log(response)
        res.send(JSON.stringify(response.data))
        })
        .catch((err) => {
          console.log(err);
        })
    } else {
      res.send(result)
    }
  })
})

app.listen(port, () => {
    console.log('Server is listening on port', port);
})
