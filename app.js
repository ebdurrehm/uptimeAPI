/*
*
*   This file was created to instantinate all of the app logics
*   Author: Abdurraahim Ahmadov
*
*/


//Dependencies
const server = require('./lib/server');
const lib = require('./lib/data');
const services = require('./lib/service');

lib.list('users', (err, data)=>{
  console.log(`the error ${err}, the data: ${data}`);
})

//instantinate the app object
const app = {};

//initilaize the app
app.init = function(){
   //initilaize the server
   server.init();
   //initilaize the background services
  services.init();
}

//execute the app
app.init();

//export module
module.exports = app;