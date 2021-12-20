/*
=============================================================
This is the request handler library
=============================================================
Author: Abdurrahim Ahmadov
Date: 19.12.2021
=============================================================

*/

//dependencies
const crudLib = require('./data');
const helper = require('./helpers');


//define handler
let handlers = {

}

//users submethods
handlers._users = {};


//users handler
handlers.users = function(data, callback){
    const acceptableMethods = ['get', 'post','put','delete'];
    if (acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    } else {
        // method not allowed
        callback(405);
    }
}


//user post method
// required fields : firstName, lastName, phoneNumber, password, accepted
handlers._users.post = function(data,callback){
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length >0? data.payload.firstName:false;
    const lastName = typeof(data.payload.lastName) === 'string' &&data.payload.lastName.trim().length >0?data.payload.lastName:false;
    const phoneNumber = typeof(data.payload.phoneNumber) === 'string' && data.payload.phoneNumber.trim().length >10?data.payload.phoneNumber:false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length >8?data.payload.password:false;
    const accepted = typeof(data.payload.accepted) === 'boolean' && data.payload.accepted ===true?data.payload.accepted:false;
    
    //hash the orginal password
    let hashedPassword = helper.hash(password);
    console.log(process.env.SECRET);
    
    //this object contain user's data
    let usersObject = {
        firstName,
        lastName,
        phoneNumber,
        hashedPassword,
        accepted
    }

    //check that all of the data are true
    if(firstName&&lastName && phoneNumber && password && accepted){
        //create the new user's file 
     crudLib.create('users',phoneNumber,usersObject,(err)=>{
         if(!err){
             callback(200,{'msg':'users was successfully registered'});
         } else{
             callback(400, {'error':'the user alredy exists'});
         }
     })
    } else{
         callback(400, {'error':'some fields were missed'});
    }
    
}

//  Get method : required phone number
//@TODO only let authenticated users read their data
handlers._users.get = function(data,callback){
    //check the given value whether is valid
    let phoneNumber = typeof(data.query.phoneNumber) === 'string' && data.query.phoneNumber.trim().length > 10?data.query.phoneNumber:false;
    if(phoneNumber){
        crudLib.read('users',phoneNumber,(err,data)=>{
            if(err){
                callback(404,{"error":"the user won't found by the given phone number"});
            } else {
                delete data.hashedPassword;
               callback(200,data);
            }
        })
    }
}


// put method
//@TODO only let authenticated users update their data
//required field phoneNumber
// optional fields firstName, lastName, password
handlers._users.put = function(data,callback){
 //check the given value whether is valid
 let phoneNumber = typeof(data.payload.phoneNumber) === 'string' && data.payload.phoneNumber.trim().length > 10?data.payload.phoneNumber:false;
 if(phoneNumber){
     crudLib.read('users',phoneNumber,(err,userData)=>{
         if(!err){
        
            const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length >0? data.payload.firstName:false;
            const lastName = typeof(data.payload.lastName) === 'string' &&data.payload.lastName.trim().length >0?data.payload.lastName:false;
            const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length >8?data.payload.password:false;
        if(firstName || lastName || password){
            if(firstName){
                userData.firstName = firstName;
            }
            if(lastName){
                userData.lastName = lastName;
            }
            if(password){
                userData.hashedPassword = helper.hash(password);
            }

            //write updated data to the disk
            crudLib.update('users',phoneNumber,userData,(err)=>{
                if(!err){
                    callback(200, {'msg': 'the data successfully updated'});
                }  else{
                    callback(500, {'error': 'something went wrong while updating the data'});
                }
            })
        } else {
            callback(400, {'error':'missed value to upadte the data'})
        }

         } else{
                callback(404,{"error":"the user won't found by the given phone number"});
               
         }
     })
 } else{
     callback(400, {'error':'required field missed'})
 }
}

//delete method
//@TODO only let authenticated user delete the data
handlers._users.delete = function(data,callback){
    let phoneNumber = typeof(data.query.phoneNumber) === 'string' && data.query.phoneNumber.trim().length > 10?data.query.phoneNumber:false;
   if(phoneNumber){
    crudLib.read('users', phoneNumber,(err, userData)=>{
        if(!err){
          crudLib.delete('users', phoneNumber, (err)=>{
              if(!err){
                  callback(200, {'msg':"the user was deleted successfully "});
              } else {
                  callback(500, {'error':"the specified user could't deleted"});
              }
          })
        } else {
            callback(404,{'error':"the user won't found by the given phone number"});
        }
    })
   } else{
       callback(400, {'error': 'missing some required field'});
   }
}


//Tokens handler
handlers.tokens = function(data, callback){
    const acceptableMethods = ['get', 'post','put','delete'];
    if (acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    } else {
        // method not allowed
        callback(405);
    }
}



//container for tokens methods
handlers._tokens = {};

//Token-post method
//Required fields = phoneNumber, password
//Optional - none
handlers._tokens.post = function(data,callback){
 const phoneNumber = typeof(data.payload.phoneNumber) == 'string' && data.payload.phoneNumber.trim().length>10?data.payload.phoneNumber:false;
 const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length> 8? data.payload.password:false;

 if(phoneNumber && password){
    // read user's data by the given value
    crudLib.read('users', phoneNumber, (err, userData)=>{
        if(!err){
       const hashedPassword = helper.hash(password);
       //check that the given password whether equal to user's password
       if(hashedPassword === userData.hashedPassword){
       //create new token and exipered time
       let tokenId = helper.createNewToken(20);
       let exiperedTime = Date.now()+1000*60*60;

       const tokenObject = {
           tokenId,
           exiperedTime
       }

       // store the data to disc

       crudLib.create('tokens', tokenId, tokenObject,(err)=>{
           if(!err){
               callback(200, {"msg":"the new token generated successfully"});
           } else {
               callback(500, {"error":"Something went wrong while generating new token"});
           }
       })
       } else {
           callback(400, {"error":"the passwords doesn't match the user's password"});
       }
        } else {
            callback(400, {"error":"the user's data couldn't found"})
        }
    })
 } else{
     callback(400, {'error':"the required fields were missed"});
 }
}


//sample handler
handlers.sample = (datas, callback)=>{
  callback(406, {'name':'sample handler'})
}

//notfound handler
handlers.notFound = (datas, callback)=>{
  callback(404);
}





module.exports = handlers;

