/*eslint-env node, express*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// create a new express server
var app = express();

var httpRequest = require('request');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


app.get('/getAuthor', function(req, res) {
	console.log("Hello Author");

	console.log("VCAP");
	console.log(process.env);
	var username = 'wim@antwerpportauthority.be';
	var password = 'wbid01bm';
	var authData =  "Basic " + new Buffer(username + ":" + password).toString("base64");
	var options = {
		url: 'https://api.us.apiconnect.ibmcloud.com/aazraqegibmcom-svp-dev/chain2-catalog/SVPService/locations',
		method: 'POST',
		headers: {
			'Content-Type': 'application/xml',
			'Authorization':authData,
			'x-ibm-client-id':'078bd6b7-dfcc-4c58-8b6c-061b731e9129'
		},
		form: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://svp.poc.com/wsdl"><soapenv:Header/><soapenv:Body><wsdl:locations/></soapenv:Body></soapenv:Envelope>'
	};
	httpRequest(
		options,
		function(error, response, body) {
				console.log("body");
				console.log(body);
				console.log("error");
				console.log(error);
		}
	);
});



// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
	// print a message when the server starts listening
	console.log("server starting on " + appEnv.url);
});