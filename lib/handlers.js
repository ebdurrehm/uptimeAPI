/*
=============================================================
This is the request handler library
=============================================================
Author: Abdurrahim Ahmadov
Date: 19.12.2021
=============================================================

*/

//dependencies
const config = require('../config');
const crudLib = require('./data');
const helper = require('./helpers');
const util = require('util');
const debug = util.debug('handlers');


//define handler
let handlers = {

}

//users submethods
handlers._users = {};


//users handler
handlers.users = function (data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        // method not allowed
        callback(405);
    }
}


//user post method
// required fields : firstName, lastName, phoneNumber, password, accepted
handlers._users.post = function (data, callback) {
    const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
    const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
    const phoneNumber = typeof (data.payload.phoneNumber) === 'string' && data.payload.phoneNumber.trim().length > 10 ? data.payload.phoneNumber : false;
    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 8 ? data.payload.password : false;
    const accepted = typeof (data.payload.accepted) === 'boolean' && data.payload.accepted === true ? data.payload.accepted : false;

    //hash the orginal password
    let hashedPassword = helper.hash(password);
    

    //this object contain user's data
    let usersObject = {
        firstName,
        lastName,
        phoneNumber,
        hashedPassword,
        accepted
    }

    //check that all of the data are true
    if (firstName && lastName && phoneNumber && password && accepted) {
        //create the new user's file 
        crudLib.create('users', phoneNumber, usersObject, (err) => {
            if (!err) {
                callback(200, { 'msg': 'users was successfully registered' });
            } else {
                callback(400, { 'error': 'the user alredy exists' });
            }
        })
    } else {
        callback(400, { 'error': 'some fields were missed' });
    }

}

//  Get method : required phone number

handlers._users.get = function (data, callback) {
    //check the given value whether is valid
    let phoneNumber = typeof (data.query.phoneNumber) === 'string' && data.query.phoneNumber.trim().length > 10 ? data.query.phoneNumber : false;
    if (phoneNumber) {
        handlers._tokens.verify(data.headers.tokenid, phoneNumber, (err) => {
            if (!err) {
                crudLib.read('users', phoneNumber, (err, data) => {
                    if (err) {
                        callback(404, { "error": "the user won't found by the given phone number" });
                    } else {
                        delete data.hashedPassword;
                        callback(200, data);
                    }
                })
            } else {
                callback(403, { "error": "access is denied, the token is invalid or have not given" });

            }

        });


    }
}


// put method
//required field phoneNumber
// optional fields firstName, lastName, password
handlers._users.put = function (data, callback) {
    //check the given value whether is valid
    let phoneNumber = typeof (data.payload.phoneNumber) === 'string' && data.payload.phoneNumber.trim().length > 10 ? data.payload.phoneNumber : false;
    if (phoneNumber) {
        handlers._tokens.verify(data.headers.tokenid, phoneNumber, (err) => {
            if (!err) {
                crudLib.read('users', phoneNumber, (err, userData) => {
                    if (!err) {

                        const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
                        const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
                        const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 8 ? data.payload.password : false;
                        if (firstName || lastName || password) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.hashedPassword = helper.hash(password);
                            }

                            //write updated data to the disk
                            crudLib.update('users', phoneNumber, userData, (err) => {
                                if (!err) {
                                    callback(200, { 'msg': 'the data successfully updated' });
                                } else {
                                    callback(500, { 'error': 'something went wrong while updating the data' });
                                }
                            })
                        } else {
                            callback(400, { 'error': 'missed value to upadte the data' })
                        }

                    } else {
                        callback(404, { "error": "the user won't found by the given phone number" });

                    }
                })
            } else {
                callback(403, { "error": "access is denied, the token is invalid or have not given" });
            }
        })
    } else {
        callback(400, { 'error': 'required field missed' })
    }//
}

//delete method

handlers._users.delete = function (data, callback) {
    let phoneNumber = typeof (data.query.phoneNumber) === 'string' && data.query.phoneNumber.trim().length > 10 ? data.query.phoneNumber : false;
    if (phoneNumber) {
        handlers._tokens.verify(data.headers.tokenid, phoneNumber, (err) => {
            if (!err) {
                crudLib.read('users', phoneNumber, (err, userData) => {
                    if (!err) {
                        crudLib.delete('users', phoneNumber, (err) => {
                            if (!err) {
                                callback(200, { 'msg': "the user was deleted successfully " });
                            } else {
                                callback(500, { 'error': "the specified user could't deleted" });
                            }
                        })
                    } else {
                        callback(404, { 'error': "the user won't found by the given phone number" });
                    }
                })
            } else {
                callback(403, { "error": "access is denied, the token is invalid or have not given" })
            }
        }
        )
    } else {
        callback(400, { 'error': 'missing some required field' });
    }
}


//Tokens handler
handlers.tokens = function (data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
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
handlers._tokens.post = function (data, callback) {
    const phoneNumber = typeof (data.payload.phoneNumber) == 'string' && data.payload.phoneNumber.trim().length > 10 ? data.payload.phoneNumber : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 8 ? data.payload.password : false;

    if (phoneNumber && password) {
        // read user's data by the given value
        crudLib.read('users', phoneNumber, (err, userData) => {
            if (!err) {
                const hashedPassword = helper.hash(password);
                //check that the given password whether equal to user's password
                if (hashedPassword === userData.hashedPassword) {
                    //create new token and exipered time
                    let tokenId = helper.createNewToken(20);
                    let exiperedTime = Date.now() + 1000 * 60 * 60;

                    const tokenObject = {
                        tokenId,
                        exiperedTime,
                        phoneNumber
                    }

                    // store the data to disc

                    crudLib.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, { "msg": "the new token generated successfully" });
                        } else {
                            callback(500, { "error": "Something went wrong while generating new token" });
                        }
                    })
                } else {
                    callback(400, { "error": "the passwords doesn't match the user's password" });
                }
            } else {
                callback(400, { "error": "the user's data couldn't found" })
            }
        })
    } else {
        callback(400, { 'error': "the required fields were missed" });
    }
}


//Token-get method
// required data : tokenId
// optional data : none

handlers._tokens.get = function (data, callback) {
    const tokenId = typeof (data.query.tokenId) == 'string' && data.query.tokenId.trim().length >= 20 ? data.query.tokenId : false;
    if (tokenId) {
        // read data from the storage
        crudLib.read('tokens', tokenId, (err, tokenData) => {
            if (!err) {
                callback(200, tokenData);
            } else {
                callback(404, { "error": "the token data wasn't found" });
            }
        })
    } else {
        callback(400, { "error": "the required field was missed" });
    }
}

//Token - put method
//reuired fields: id , extend
//optional fields : none

handlers._tokens.put = function (data, callback) {
    const tokenId = typeof (data.payload.tokenId) == 'string' && data.payload.tokenId.trim().length >= 20 ? data.payload.tokenId : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend === true ? data.payload.extend : false;

    if (tokenId && extend) {
        //read token's data
        crudLib.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                if (tokenData.exiperedTime > Date.now()) {
                    //upadte expired time 
                    tokenData.exiperedTime = Date.now() + 1000 * 60 * 60;
                    //write the updated data to the storage
                    crudLib.update('tokens', tokenId, tokenData, (err) => {
                        if (!err) {
                            callback(200, { "msg": "the token expire time was extended successfully" });
                        } else {
                            callback(500, { "error": "something went wrong while extending exipre time" });
                        }
                    })
                } else {
                    callback(500, { "error": "the token validity time is expired" });
                }
            } else {
                callback(404, { "error": "the data you searched was not found" });
            }
        })
    } else {
        callback(400, { "error": "the required filed(s) were missed or invalid" });
    }
}

//Token - delete
// required fields : tokenId
// optional fields : none

handlers._tokens.delete = function (data, callback) {
    const tokenId = typeof (data.query.tokenId) == 'string' && data.query.tokenId.trim().length >= 20 ? data.query.tokenId : false;
    if (tokenId) {
        //read the data
        crudLib.read('tokens', tokenId, (err, tokenData) => {
            if (!err) {
                // delete the data of the token
                crudLib.delete('tokens', tokenId, (err) => {
                    if (!err) {
                        callback(200, { "msg": "the token data was deleted successfully" });
                    } else {
                        callback(500, { "error": "the token data was not deleted , something went wrong" });
                    }
                })
            } else {
                callback(404, { "error": "the token data was not found" });
            }
        })
    } else {
        callback(400, { "error": "the required fields was missed" });

    }
}

//verify the token
handlers._tokens.verify = function (tokenId, phoneNumber, callback) {
    debug.log(tokenId, phoneNumber);
    const tokenID = typeof (tokenId) === 'string' && tokenId.trim().length >= 20 ? tokenId : false;
    const phoneNum = typeof (phoneNumber) == 'string' && phoneNumber.trim().length > 10 ? phoneNumber : false;

    if (tokenID && phoneNum) {
        crudLib.read('tokens', tokenID, (err, tokenData) => {
            if (!err && tokenData.exiperedTime > Date.now()) {
                if (tokenData.phoneNumber === phoneNum && tokenData.tokenId === tokenID) {
                    callback(false);
                }
            } else {
                callback(true);
            }
        })
    } else {
        callback(true);
    }
}


//Checks handler
handlers.checks = function (data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        // method not allowed
        callback(405);
    }
}



//container for the all checks method
handlers._checks = {};


//Checks - post method
//required fields : protocol,url,method,successCodes,timeoutSeconds
//Optionl: none
handlers._checks.post = function (data, callback) {
    const protocol = typeof (data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 1 ? data.payload.url : false;
    const method = typeof (data.payload.method) === 'string' && ['get', 'put', 'post', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof (data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds >= 1 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const tokenId = typeof (data.headers.tokenid) === 'string' && data.headers.tokenid.trim().length >= 20 ? data.headers.tokenid : false;
        debug.log(data.headers.tokenid);
        //read token data
        if (tokenId) {
            crudLib.read('tokens', tokenId, (err, tokenData) => {
                if (!err && tokenData.exiperedTime > Date.now()) {
                    const phoneNumber = tokenData.phoneNumber;

                    //read user's data
                    crudLib.read('users', phoneNumber, (err, userData) => {
                        if (!err && userData) {
                            const checks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                            if (checks.length < config.maxCheck) {
                                let checkId = helper.createNewToken(15);
                                let phoneNumber = userData.phoneNumber;
                                let checkObject = {
                                    checkId,
                                    method,
                                    url,
                                    successCodes,
                                    protocol,
                                    timeoutSeconds,
                                    phoneNumber
                                }

                                crudLib.create('checks', checkId, checkObject, (err) => {
                                    if (!err) {
                                        userData.checks = checks;
                                        userData.checks.push(checkId);

                                        crudLib.update('users', phoneNumber, userData, (err) => {
                                            if (!err) {
                                                callback(200, { "msg": "new checks created successfully" });
                                            } else {
                                                callback(500, { "error": "something went wrong, user's data wasn;t updated" });
                                            }
                                        })
                                    } else {
                                        callback(500, { "err": " something went wrong, data wasn't created" });
                                    }
                                })
                            } else {
                                callback(400, { "error": "The user has alredy maxiumum number of check " + config.maxCheck });
                            }
                        } else {
                            callback(404, { "error": "the user's data not found" });
                        }
                    })
                } else {
                    callback(403, { "error": "accsess denied, your authentication wasn't verified or your token expired" });
                }
            })
        } else {
            callback(403, { "error": "accsess denied, your authentication wasn't verified" });
        }
    } else {
        callback(400, { "error": "the required fileds are missed" });
    }


}


//checks - get method
//required data : checkId 
//OPTIONAL data : none

handlers._checks.get = function (data, callback) {
    const checkId = typeof (data.query.checkId) === 'string' && data.query.checkId.trim().length >= 15 ? data.query.checkId : false;

    if (checkId) {

        //read check data
        crudLib.read('checks', checkId, (err, checkData) => {
            const phoneNumber = checkData.phoneNumber;
           

            if (!err && checkData) {
                handlers._tokens.verify(data.headers.tokenid, phoneNumber, (err) => {
                    if (!err) {
                        callback(200, checkData);
                    } else {
                        callback(403, { "error": "access denied, unuthorizated request" })
                    }
                })

            } else {
                callback(404, { "error": "the data wasn't found" });
            }
        })

    } else {
        callback(400, { "error": "the required field was missed" });
    }
}

//checks - put method
//required data : checkId
//optional data: method, url, successCodes, timeout
handlers._checks.put = function (data, callback) {
    //check required field
    const checkId = typeof (data.payload.checkId) === 'string' && data.payload.checkId.trim().length >= 15 ? data.payload.checkId : false;

    if (checkId) {

        // check optional fields
        const protocol = typeof (data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
        const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 1 ? data.payload.url : false;
        const method = typeof (data.payload.method) === 'string' && ['get', 'put', 'post', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
        const successCodes = typeof (data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
        const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds >= 1 ? data.payload.timeoutSeconds : false;
        if (protocol || url || method || successCodes || timeoutSeconds) {
            crudLib.read('checks', checkId, (err, checkData) => {
                if (!err) {
                    if (protocol) {
                        checkData.protocol = protocol;
                    }
                    if (url) {
                        checkData.url = url;

                    }
                    if (method) {
                        checkData.method = method;

                    }
                    if (successCodes) {
                        checkData.successCodes = successCodes;
                    }
                    if (timeoutSeconds) {
                        checkData.timeoutSeconds = timeoutSeconds;
                    }
                    // verify that user is authenticated user
                    handlers._tokens.verify(data.headers.tokenid, checkData.phoneNumber, (err) => {
                        if (!err) {
                            //update data 
                            crudLib.update('checks', checkId, checkData, (err) => {
                                if (!err) {
                                    callback(200, { "msg": "the data is updated successfully" });
                                } else {
                                    callback(500, { "error": "something went wrong while updating the data" });
                                }
                            })
                        } else {
                            callback(403, { "error": "access is denied, unauthorization request" });
                        }
                    })

                } else {
                    callback(404, { "error": "the check data was not found" });
                }
            })
        } else {
            callback(400, { "error": "missing data to update" });
        }

    } else {
        callback(400, { "error": "missing required filed" });
    }
}


//Checks - delete
// required field : checkId
//optional: none

handlers._checks.delete = function (data, callback) {

    //check required field
    const checkId = typeof (data.query.checkId) === 'string' && data.query.checkId.trim().length >= 15 ? data.query.checkId : false;

    if (checkId) {

        //read check data
        crudLib.read('checks', checkId, (err, checkData) => {
            if (!err) {
                //verify the user
                handlers._tokens.verify(data.headers.tokenid, checkData.phoneNumber, (err) => {
                    if (!err) {
                        // delete the data
                        crudLib.delete('checks', checkId, (err) => {
                            if (!err) {
                                callback(200, { "msg": "the data was deleted successfully" });
                            } else {
                                callback(500, { "error": "something went wrong while deleting the data" });
                            }
                        })
                    } else {
                        callback(403, { "error": "access is denied, unauthorization request" });
                    }
                })

            } else {
                callback(404, { "error": "the data was not found" });
            }
        })


    } else {
        callback(400, { "error": "the required field  was missed" });
    }

}



//sample handler
handlers.sample = (datas, callback) => {
    callback(406, { 'name': 'sample handler' })
}

//notfound handler
handlers.notFound = (datas, callback) => {
    callback(404);
}





module.exports = handlers;

