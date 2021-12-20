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

module.exports = helper;