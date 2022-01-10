// Dependencies
var path = require('path');
var fs = require('fs');
var data = require('./data');
var https = require('https');
var http = require('http');
var helpers = require('./helpers');
var url = require('url');



//instantinate services object
let services = {};

// get all checks
services.getAllChecks = function () {
    //gather all check files
    data.list('checks', (err, checkFiles) => {
        if (!err && checkFiles) {
            checkFiles.forEach(check => {
                //get all file's data
                data.read('checks', check, (err, orginalCheck) => {
                    console.log(check);
                    if (!err && orginalCheck) {
                        // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
                        services.validateCheckData(orginalCheck);
                    } else {
                        console.log({ 'error': "the check data was not found" });
                    }
                })
            });
        } else {
            console.log({ "error": "not found any check" })
        }
    })
}


//validate check data
services.validateCheckData = function (originalCheckData) {
    originalCheckData = typeof (originalCheckData) === "object" && originalCheckData !== 'null' ? originalCheckData : false;
    originalCheckData.checkId = typeof (originalCheckData.checkId) === "string" && originalCheckData.checkId.length >= 15 ? originalCheckData.checkId : false;
    originalCheckData.method = typeof (originalCheckData.method) === "string" && ["put", "get", "post"].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.protocol = typeof (originalCheckData.protocol) === "string" && ["http", "https"].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.userPhone = typeof (originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone : false;
    originalCheckData.url = typeof (originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
    originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;
    // Set the keys that may not be set (if the workers have never seen this check before)
    originalCheckData.state = typeof (originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    if (
        originalCheckData.checkId &&
        originalCheckData.method &&
        originalCheckData.protocol &&
        originalCheckData.userPhone &&
        originalCheckData.url &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds &&
        originalCheckData.state &&
        originalCheckData.lastChecked
    ) {
        //perform check data
        services.performCheckData(originalCheckData);
    } else {
        console.log({ "error": "the provided data isn't corrected" });
    }
}

//perform check data
services.performCheckData = function (originalCheckData) {
    //set default outcome object
    let outCome = {
        'error': false,
        'responseCode': false,
    };

    //set default sentOutcome false
    let sentOutCome = false;

    // Parse the hostname and path out of the originalCheckData
    const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path;

    //construct the request object 
    const requestDetails = {
        'protocol': originalCheckData.protocol,
        'hostname': hostname,
        'path': path,
        'timeout': originalCheckData.timeoutSeconds,
        'method': originalCheckData.method
    }

    let _useRequestModule = originalCheckData.protocol === 'http' ? orginalCheck.protocol : 'https';
    let req = _useRequestModule.request(requestDetails, (res) => {
        //update outcome response code 
        outCome.responseCode = res.statusCode;

        //check outcome  either sent
        if (!sentOutCome) {
            services.checkOutCome(originalCheckData, outCome);
            sentOutCome = true;
        }
    })

    //bind the error event to the request, dooesn't throw any error
    req.on('error', (e) => {
        outCome.error = {
            'error': true,
            'value': e
        }
        //check outcome  either sent
        if (!sentOutCome) {
            services.checkOutCome(originalCheckData, outCome);
            sentOutCome = true;
        }

    })

    //bind timout event
    req.on('timeout', (e)=>{
        //update outcome object
        outCome.error = {
            'error': true,
            'value': 'request get timeout'
        }
        //check outcome  either sent
        if (!sentOutCome) {
            services.checkOutCome(originalCheckData, outCome);
            sentOutCome = true;
        }
    })

}

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
services.checkOutCome = function(originalCheckData, outCome){
    //decie if the check is considered up or down
    let state = !outCome.error && outCome.responseCode && originalCheckData.successCodes.indexOf(outCome.responseCode)>-1?'up':'down';

    //decide if alert needed
    let alertNeeded = originalCheckData.lastChecked && originalCheckData.state !==state? true:false;

    //update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //save the updated data
    data.update('checks', newCheckData.checkId,newCheckData, (err)=>{
        if(!err){
              if(alertNeeded){
            services.alertToCostumers(newCheckData);
              } else {
                  callback({"error":"there is nothing to update"})
              }
        } else{
          callback({"error":"an error occured during updating processs"})  
        }
    })


}

//alert to the user sms was sended
services.alertToCostumers = function(newCheckData){
    //@TODO write sms sending logic later
    console.log("sms was sended");
}


//create checking loop
services.loop = function(){
    setInterval(function(){
        //check every minute
        services.getAllChecks();
    },1000*60)
}

//initilaize the function that run all logic of the module
services.init = function(){
    //check first time 
    services.getAllChecks();

    //re-check  every second
    services.loop();
}

//export the module
module.exports = services;



