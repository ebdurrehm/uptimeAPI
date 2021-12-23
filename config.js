/*
*
* Create and export environments
*
*/


// create environments object
let environments = {};

// create dev environments mode
environments.dev = {
    'envName': 'dev',
    'httpPort': 8000,
    'httpsPort': 8001,
    'maxCheck': 5
}

//create production environment
environments.production = {
    'envName': 'production',
    'httpPort': 8080,
    'httpsPort': 443,
    'maxCheck': 5
}

//set default environment
let currentEnv = typeof(process.env.NODE_ENV) ==='string'?process.env.NODE_ENV.toLowerCase():'';

//check the environment is one of the environments above, if no set default environment as dev
let env = typeof(environments[currentEnv]) !== 'undefined'? environments[currentEnv]: environments.dev;

// exports environment
module.exports = env;