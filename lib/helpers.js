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

module.exports = helper;