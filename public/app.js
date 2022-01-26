/* 
this file contains the frontend logic of the app

*/

//define the main container object for the logic
const app = {};

//app config
app.config = {
    'token': false 
}

//define client object
app.client = {};

//define client interface for the AJAX request
app.client.request = function(method, urlStringObj, headerObj, payload, tokenObj, path, callback){
    // check all of the parametrs to enshure they are either correct
   method = typeof(method) === 'string' && ['GET', 'PUT', 'POST','DELETE'].indexOf(method)>-1?method:'GET';
   urlStringObj = typeof(urlStringObj) === 'object' && urlStringObj !== null? urlStringObj: {};
   headerObj = typeof(headerObj) === 'object' && headerObj !== null? headerObj: {};
   payload = typeof(payload) === 'object' && payload !== null? payload: {};
   tokenObj = typeof(tokenObj) === 'object' && tokenObj !== null? tokenObj:{};
   path = typeof(path) === 'string' && path.length>0?path:'/';
   callback = typeof(callback) === 'function'?callback: false; 

   // define url based by the url queery string
   let url = path +'?';
   let count = 0;
   for (let query in urlStringObj){
       if(urlStringObj.hasOwnProperty(query)){
           count ++;
           if (count>0){
               url +='&';
           }

           url+=query +'='+ urlStringObj[query];
       }
   }

   //define AJAX object
   const xhr =  new XMLHttpRequest();
   xhr.open(method, url, true);
   
   // set the xhr request header
   xhr.setRequestHeader('Content-Type', 'application/json');

   // loop over header object to get all of the header 
   for (let header in headerObj){
       if(headerObj.hasOwnProperty(header)){
           xhr.setRequestHeader(header,headerObj[header]);
       }
   }

   //check if session token have to set then set it to the header
   if(app.config.token){
       xhr.setRequestHeader('token', app.config.token.id);

   }

   //if response come after request sent, handle the response 
   xhr.onreadystatechange = function(){
       if (xhr.readyState === XMLHttpRequest.DONE){
           const statusCode = xhr.status;
           const responseText  =  xhr.responseText;
    
   //if any callback was added, call the callback
   if (callback){

    try{
       const parsedResponse =  JSON.parse(responseText);
       callback(statusCode, parsedResponse);
    }  catch(e){
      callback(statusCode, e);

    }

   }
}
}


   // stringfy the payload
   const payloadString = JSON.stringify(payload);

   // send the payload
   if(payloadString){
    xhr.send(payloadString);
   }
   
}