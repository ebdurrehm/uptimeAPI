/*
this file is a file logging script file and here stay 
the logic that process datas to the log file 

*/

//Dependencies
const fs = require('fs');
const path = require('path');

//initilaize container object that contain all of the logic
let log = {};

//create base dir
const baseDir = path.join(__dirname,'/../logs/');

//create appendData function that append all log data to the file.log 
log.appendData = function(strObj, fileName){
     // open a file
     fs.open(baseDir+'/'+fileName+'.log','a', (err, fd)=>{
         if(!err && fd){
        //append data to the file
        fs.appendFile(fd,strObj+'\n',(err)=>{
            if(!err){
          console.log('the data successfully appendend to the file');
            } else{
                console.log({'error':"an error occured while appending the data to the file"});
            }
        })
         } else {
             console.log({'error':"an error occured while opening the file"});
         }
     })
} 

//export the module
module.exports = log;

