/*eslint-env node */
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

// Allow passing parameters
var bodyParser = require('body-parser');
app.use(bodyParser());

// Call the module required for the calculation of ETB
var etbCalculator = require('./modules/etbCalculator');

// Call the module required for the calculation of ETB taking into consideration the weather condition
var etbCalculatorWeather = require('./modules/etbCalculatorWeather');

// Call the module required for dealing with SVP Functionalities
var svpClient = require('./modules/svpClient');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

//The client ID retrieved from API Connect 
var apiConnectClientId = 'cb73fb49-b5ba-43cf-974c-47f10138d6f7';

//Weather Company Endpoint
var weatherCompanyEndpoint = "https://5fc68d04-df6d-418d-8154-6abab22f5b12:T433d4vTeb@twcservice.mybluemix.net";


app.get('/calculateETB', function(req, res) {
	var objectId = req.query.objectId;
	var isWeather = req.query.isWeather;
	if (!isWeather || !objectId) {
		res.status(400).send();
	}

	svpClient.queryEvent(objectId,apiConnectClientId, function(error, event) {
		if (error) {
			res.status(500).send();
		} else {
			if (isWeather==='true') { //Calculate ETB taking weather condition into consideration
				etbCalculatorWeather.calculateETBWithWeather(event, weatherCompanyEndpoint, function(etb){
					res.send(etb.etb + "; a delay is estimated because of a windspeed " + etb.windSpeed + " MPH");
				});
			} else { // Calculate ETB without taking weather condition
				var etb = etbCalculator.calculateETB(event);
				res.send(etb);
			}			
		}
	});
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
	// print a message when the server starts listening
	console.log("server starting on " + appEnv.url);
});