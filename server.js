require('newrelic');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const redis = require('redis');
const { client } = require('./redisDemo.js');
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
    // seems like to me that every time you create a new node cluster, its trying to bind to this port again
    // which is taken. doesn't really make sense to me, but thats prob it
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
}

app.get('/id/:query', (req, res) => {

  client.get(req.params.query, function (error, result) {
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

// axios.get(`http://localhost:5000/id/${req.params.query}`)

// const chartReq = axios.create({
//     baseURL: 'http://ec2-13-57-177-212.us-west-1.compute.amazonaws.com:2468/'
//   });

//   app.get('/api/:stockId', (req, res) => {
//     chartReq.get(`api/${req.params.stockId}`)
//     .then((response) => {
//       res.send(response.data);
//     })
//   })

//   const buyFormReq = axios.create({
//       baseURL: 'http://ec2-3-84-115-167.compute-1.amazonaws.com:8080/' 
//   });

//   app.get('/stocks/:query', (req, res) => {
//       buyFormReq.get(`stocks/${req.params.query}`)
//       .then((response) => {
//           res.send(response.data);
//       })
//   })

app.listen(port, () => {
    console.log('Server is listening on port', port);
})
