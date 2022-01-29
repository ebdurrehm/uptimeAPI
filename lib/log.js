/*
this file is a file logging script file and here stay 
the logic that process datas to the log file 

*/

//Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const debug = require('util').debuglog('log');


//initilaize container object that contain all of the logic
let log = {};

//create base dir
const baseDir = path.join(__dirname, '/../logs');

//create appendData function that append all log data to the file.log 
log.appendData = function (strObj, fileName) {
    // open a file
    fs.open(baseDir + '/' + fileName + '.log', 'a', (err, fd) => {
        if (!err && fd) {
            //append data to the file
            fs.appendFile(fd, strObj + '\n', (err) => {
                if (!err) {
                    debug('\x1b[32m%s\x1b[0m','✅ the data successfully appendend to the file');
                } else {
                    debug({ '🛑 error': "an error occured while appending the data to the file" });
                }
            })
        } else {
            debug({ '🛑 error': "an error occured while opening the file" });
        }
    })
}

//list the log datas

log.list = function (inculedCompressedData, callback) {
    fs.readdir(baseDir, (err, logFiles) => {
        if (!err && logFiles && logFiles.length > 0) {
            let trimmedFiles = [];
            logFiles.forEach(fileName => {

                if (fileName.indexOf('.log') > -1) {
                    trimmedFiles.push(fileName.replace('.log', ''));
                }
                if (fileName.indexOf('gz.b64') > -1 && inculedCompressedData) {
                    trimmedFiles.push(fileName.replace('.gz.b64'));
                }

                callback(false, trimmedFiles);
            })
        } else {
            callback(err, logFiles);
        }
    })
}


//compress the data 
log.compress = function (logId, newId, callback) {
    const sourceFile = logId + '.log';
    const destFile = newId + '.gz.b64';

    //read the file
    fs.readFile(baseDir + sourceFile, 'utf8', (err, stringData) => {
        if (!err && stringData) {
            // compress tha data 
            zlib.gzip(stringData, (err, buffer) => {
                if (!err && buffer) {
                    fs.open(baseDir + destFile, 'wx', (err, fd) => {
                        if (!err) {
                            fs.write(fd, buffer.toString('base64'), (err) => {
                                if (!err) {
                                    fs.close(fd, (err) => {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    })
                                } else {
                                    callback(err);
                                }
                            })
                        }
                    })
                } else {
                    callback(err)
                }
            })
        } else {
            callback(err);
        }
    })
}

//decompress the data 
log.decompress = function (fileId, callback) {
    const fileName = fileId + 'gz.b64';
    fs.readFile(baseDir + fileName, 'utf8', (err, data) => {
        if (!err && data) {
            const inputBuffer = Buffer.from(data, 'base64');
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if (!err && outputBuffer) {
                    const str = outputBuffer.toString();
                    callback(false, str);
                } else {
                    callback(err);
                }
            })
        } else {
            callback(err);
        }
    })
}

// Truncate a log file
log.truncate = function(logId,callback){
    fs.ftruncate(baseDir+logId+'.log', 0, function(err){
      if(!err){
        callback(false);
      } else {
        callback(err);
      }
    });
  };


//export the module
module.exports = log;

