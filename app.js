/*
*
*   This file was created to instantinate all of the app logics
*   Author: Abdurraahim Ahmadov
*
*/


//Dependencies
const server = require('./lib/server');
const services = require('./lib/service');
const cli = require('./lib/cli');


//instantinate the app object
const app = {};

//initilaize the app
app.init = function(){
   //initilaize the server
   server.init();
   
   //initilaize the background services
  services.init();

  // start cli , but start it after all the other module started
  setTimeout(()=>{
    cli.init();
  },60)
}

//execute the app
app.init();

//export module
module.exports = app;