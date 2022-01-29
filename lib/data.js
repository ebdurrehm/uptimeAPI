/*

===================================================
This is the CRUD operations library that using node 
fs module for reading, updating , writing 
and deleting a file 
===================================================

Autor: Abdurrahim Ahmadov

Date: 18.12.2021

===================================================

@Documentation :file flags


'a': Open file for appending. The file is created if it does not exist.

'ax': Like 'a' but fails if the path exists.

'a+': Open file for reading and appending. The file is created if it does not exist.

'ax+': Like 'a+' but fails if the path exists.

'as': Open file for appending in synchronous mode. The file is created if it does not exist.

'as+': Open file for reading and appending in synchronous mode. The file is created if it does not exist.

'r': Open file for reading. An exception occurs if the file does not exist.

'r+': Open file for reading and writing. An exception occurs if the file does not exist.

'rs+': Open file for reading and writing in synchronous mode. Instructs the operating system to bypass the local file system cache.

This is primarily useful for opening files on NFS mounts as it allows skipping the potentially stale local cache. It has a very real impact on I/O performance so using this flag is not recommended unless it is needed.

This doesn't turn fs.open() or fsPromises.open() into a synchronous blocking call. If synchronous operation is desired, something like fs.openSync() should be used.

'w': Open file for writing. The file is created (if it does not exist) or truncated (if it exists).

'wx': Like 'w' but fails if the path exists.

'w+': Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).

'wx+': Like 'w+' but fails if the path exists.
*/

//Dependencies 
const fs = require('fs');
const path = require('path');
const helper = require('./helpers');


//Create lib object for containing the functions and data
let lib = {};

//base directory
lib.baseDir = path.join(__dirname, '/../data/');

//Create function that create a new data file
lib.create = function (dir, file, data, callback) {
    //open the file
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fd) => {
        if (!err && fd) {
            //convert the data to string 
            let stringData = JSON.stringify(data);
            // write the data to a new file
            fs.write(fd, stringData, (err) => {
                if (!err) {
                    fs.close(fd, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('an error occured during closeing the file');
                        }
                    })
                } else {
                    callback('an error occured while writing the data to the file');
                }
            })
        } else {
            callback('error occured while opening the file');
        }
    })
}

//create read function 

lib.read = function (dir, file, callback) {
    //open the file to reading the data
    fs.open(this.baseDir + dir + '/' + file + '.json', 'r', (err, fd) => {
        if (!err) {
            // read the data from the file
            fs.readFile(fd, 'utf8', (err, data) => {
                if (!err && data) {
                    //return read data
                    callback(false, helper.stringToObject(data));
                } else {
                    callback('an error occured while reading the file');
                }
            })
        } else {
            callback('an error occured during open the file');
        }
    })
};

// create update function
lib.update = function (dir, file, data, callback) {
    fs.open(this.baseDir + dir + '/' + file + '.json', 'r+', (err, fd) => {
        if (!err) {
            //convert the data to string 
            let stringData = JSON.stringify(data);
            fs.ftruncate(fd, (err) => {
                if (!err) {
                    fs.write(fd, stringData, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('an error occured while updating the data')
                        }
                    })
                } else {
                    callback('an error occured while truncating the data');
                }
            })
        } else {
            callback('an error occured while opening the file');
        }
    })
}


//create a function that delete a file completely
lib.delete = function(dir, file, callback){
    fs.open(this.baseDir+dir+'/'+file+'.json','r',(err,fd)=>{
        if(!err){

            fs.unlink(this.baseDir+dir+'/'+file+'.json', (err)=>{
                if(!err){
                    callback(false);
                } else{
                    callback('an error occured while deleting the file');
                }
            })
        } else{
            callback('an error occured while opening the file');
        }
    })
}

//list all of the files in a directory

lib.list =  function(dir, callback){
    fs.readdir(lib.baseDir+dir+'/', (err, files)=>{
        if(!err && files && files.length>0){
         let allFiles = [];
         files.forEach((file)=>allFiles.push(file.replace('.json', '')));
         callback(false, allFiles);
        } else {
            callback(err,files);
        }
    })
}


//export the library 

module.exports = lib;

