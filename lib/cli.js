/*
========================================================================================
this is the cli app file that contains all of the logic of CLI
=============================================================================

*/


//Dependencies
const readLine = require('readline');
const util = require('util');
const debug = util.debuglog('CLI');
const eventEmitter = require('events').EventEmitter;

// create events object from EventEmitter class
const cliEvents =  new eventEmitter();

//Instantinate cli object
const cli = {};


//create string processor function
cli.processString =  function(str){
  //check str
  str = typeof(str) === 'string' && str.trim().length>0?str.trim():false;

  if(str){
      // define the unique command lists
    const uniqueCommands = [
        'exit',
        'help',
        'list users',
        'stats',
        'more user info',
        'list checks',
        'more check info',
        'list logs',
        'more log info'
    ];
     
    var notFound = false;
    //take every command from the array and check either user entered command is match with the uniqe commands
    uniqueCommands.some((command)=>{
        if(str.toLowerCase().indexOf(command)>-1){
            notFound = false;
            //emit the command event and call handler function
            cliEvents.emit(command, str);
            return true;
        }
        else{
            notFound = true;
        }
       
    })
    if(notFound){
        console.log('\x1b[31m%s\x1b[0m',`invalid command "${str}": plase try again`);
    }
      
  }
}

// create init function
cli.init = function (){
// send the message that cli app is running
console.log('\x1b[34m%s\x1b[0m','The CLI is running');

//create cli interface
const _interface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '▶▶▶ '
});

// start initial prompt
_interface.prompt();

//handle each entered line by seperatle when user write it ,
_interface.on('line', (string)=>{
  cli.processString(string);
})

//re-call prompt
_interface.prompt();


//kill the process if the user stops the cli
_interface.on('close',()=>{
    process.exit(0);
})

};


//export the module 
module.exports = cli;
