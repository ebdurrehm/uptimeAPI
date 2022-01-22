/*

=========================================================
This library is used as container of the helper functions
=========================================================
Author: Abdurrahim Ahmadov
Date: 19.12.2021
=========================================================


*/

//Dependencies
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

//Container object
let helper = {};


//stringToObject

helper.stringToObject = function(str){
    let string = typeof(str) === "string" && str.length >0?str:false;
    if(string){
        let obj = JSON.parse(str);
        return obj;

    } else {
      return '';
    }
    
}


//hash method that hash the given password and return hashed password
helper.hash = function(password){
    let hashedPassword = crypto.createHmac('sha256',process.env.SECRET).update(password).digest('hex');
    return hashedPassword;
}

//generate random string with 20 characters of length
helper.createNewToken = function(strLength){
    const possibleCharacters = "abcdefghklmnopstuywzqvx1234567890";
    let newTokenId = '';
    for(let i =0; i<strLength;i++){
        newTokenId +=possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
        
    }
    return newTokenId;
}

//get html template
helper.getTemplate = function(templateName, callback){
    //check templateName is in correct format
    templateName = typeof(templateName) ==='string' && templateName.length>0?templateName: false;
    
    const templateDir = path.join(__dirname, '/../templates/');
    if(templateName){
      //read string from the html file
      fs.readFile(templateDir+templateName+'.html',(err, str)=>{
          if(!err&&str){
              const buffer = Buffer.from(str);
              const newStr = buffer.toString('utf8');
              
            callback(false, newStr);
          } else {
              callback('the html file was not found');
          }
      })
    } else {
        callback("template name was not specified correctly");
    }
    
}

//get static file 
helper.getStaticFile = function(fileName, callback){
    
    fileName = typeof(fileName) ==='string' &&fileName.length>0?fileName: false;
    if(fileName){
    const fileDir = path.join(__dirname, '/../public');
     fs.readFile(fileDir+fileName,(err, data)=>{
         if(!err && data){
            
            callback(false, data);
            
         } else {
             callback('the file was not found');
             
         }
     })
    } else {
        callback("the specified file name isn't correct");
    }
}

module.exports = helper;