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
     
// event handlers
cliEvents.on('help',(str)=>{
    cli.responders.help(str);
})

cliEvents.on('exit',(str)=>{
    cli.responders.exit(str);
})
cliEvents.on('list users',(str)=>{
    cli.responders.listUsers(str);
})
cliEvents.on('stats',(str)=>{
    cli.responders.listUsers(str);
})
cliEvents.on('more user info',(str)=>{
    cli.responders.listUsers(str);
})
cliEvents.on('list checks',(str)=>{
    cli.responders.listChecks(str);
})
cliEvents.on('more check info',(str)=>{
    cli.responders.moreCheckInfo(str);
})

// cli responders
cli.responders = {};

//help responder
cli.responders.help = function(str){
    // define all commands
    const commands = {
        'exit':'close the program and quit',
        'help': 'see all commands and their use cases',
        'list users': 'see all users on the system',
        'stats':'show all system statistic information',
        'more user info -- (userId)':'show spesific user info',
        'list checks':'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
        'more check info --(checkId)':'see specific check info',
        'list logs':'Show a list of all the log files available to be read (compressed and uncompressed)',
        'more log info --(logFileName)':'see specific log file info'
    }
  
     cli.horizontalLine();
     cli.centeredWrite('CLI TOOL');
     cli.horizontalLine();
     cli.verticalLine(2);


     for(let key of Object.keys(commands)){
        var value = commands[key];
        var line = '      \x1b[33m '+key+'      \x1b[0m';
        var padding = 60 - line.length;
        for (i = 0; i < padding; i++) {
            line+=' ';
        }
        line+=value;
        console.log(line);
     }
     cli.horizontalLine();


}
// write horizontal dash until end of the screen
cli.horizontalLine = function(){
    // get length of the screen
    const screenWidth = process.stdout.columns;
    let line = '';
    for (let i =0; i<screenWidth; i++){
        line+='-';
    }
    console.log(line);
}

cli.centeredWrite = function(str){
     // get length of the screen
    const screenWidth = process.stdout.columns;
    var line = '';
    //write empty string until center of the screen
    for (let i =0; i<=Math.floor(screenWidth/2); i++){
        line=line+' '; 
    }
    line = line +str;
    console.log(line);
}

cli.verticalLine = function(size){
    for(let i =0; i<=size; i++){
          console.log('');
    }
}


cli.responders.exit = function(str){
    process.exit(0);
}

cli.responders.listUsers = function(str){
    console.log('you run the list users command ');
}
cli.responders.stats = function(str){
    console.log('you are running the stats users command ');
}
cli.responders.moreUserInfo = function(str){
    console.log('you are running the more user info users command ');
}
cli.responders.listChecks = function(str){
    console.log('you are running the list checks users command ');
}
cli.responders.moreCheckInfo = function(str){
    console.log('you are running the more check info users command ');
}
    var notFound = false;
    var counter =0;
    //take every command from the array and check either user entered command is match with the uniqe commands
    uniqueCommands.some((command)=>{
        if(str.toLowerCase().indexOf(command)>-1){
            notFound = true;
            //emit the command event and call handler function
            if(counter<=1){
                cliEvents.emit(command, str);
                counter++;
                return true;
            }
            
            
        }
        else{
            notFound = false;
            
        }
       
    }) 
    
    if(!notFound){
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




//kill the process if the user stops the cli
_interface.on('close',()=>{
    process.exit(0);
})

};


//export the module 
module.exports = cli;
