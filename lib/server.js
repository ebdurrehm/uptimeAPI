/*
*Author: Abdurrahim Ahmadov
*server tasks for the API
*Date: 14-12-2021
*
*/

// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const {StringDecoder} = require('string_decoder');
const config = require('./../config');
const handlers = require('./handlers');
const helper = require('./helpers');

//instantinate server object
let server = {};

//create http server
server.httpServer = http.createServer((req ,res)=>{
    unifiedServer(req,res);
});
  

//define https server options
server.httpsOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};

//create https server
server.httpsServer = https.createServer(server.httpsOptions,(req ,res)=>{
  unifiedServer(req,res);
});


//define a request router
server.router = {
  '/sample': handlers.sample,
  '/users': handlers.users,
  '/tokens': handlers.tokens,
  '/checks': handlers.checks
}


//unified server function
server.unifiedServer = function(req,res){
  //get the url and parse it as a string object
const urlString = url.parse(req.url,true)

// get HTTP method
const method = req.method.toLowerCase();

// get headers
let headers = req.headers;

// get a path
let path =  urlString.pathname;
console.log(path);
//get query string
const query = helper.stringToObject(JSON.stringify(urlString.query));

//get payload if it have
const decoder = new StringDecoder('utf-8');
let buffer = '';

//listen req object when data streams read data chunk and write it to array
req.on('data', (data)=>{
  buffer +=decoder.write(data);
})

//when streams data reading and writing process end , write completed data to console
req.on('end',()=>{
  buffer +=decoder.end();
  
    console.log(buffer); 
    //chose the handler
  let chooseHandler = typeof(server.router[path]) !== 'undefined'?server.router[path]:handlers.notFound;
  
  //construct the data object to send to the handler
  let data = {
    'path': path,
    'method': method,
    'query':query,
    'headers': headers,
    'payload': helper.stringToObject(buffer)
  }

  //route handlers
  chooseHandler(data, (statusCode, payload)=>{
    //use status code or define as default
    statusCode = typeof(statusCode) === 'number'? statusCode:200;

    //use payload or define as default
    payload = typeof(payload) === 'object'? payload: {};

    //convert the payload to string
    let payloadString = JSON.stringify(payload);

      //log the request path
      console.log(`Returning this response:`, statusCode, payloadString);
    //return the response
    res.setHeader('Content-Type','application/json');
    res.setHeader('name','Abdurrahim');
    res.writeHead(statusCode);
    res.end(payloadString);

  
  });
});
}

//initilaize the server
server.init = function(){
    //start the http server
    server.httpServer.listen(config.httpPort,()=>{
        console.log(`server is started on port ${config.httpPort} in ${config.envName} mode`);
    })
      
    //start the https server
    server.httpsServer.listen(config.httpsPort,()=>{
        console.log(`server is started on port ${config.httpsPort} in ${config.envName} mode`);
      })
}

// export the module
module.exports = server;