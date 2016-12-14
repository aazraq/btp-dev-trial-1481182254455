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
var etbCalculator = require('./etbCalculator');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


app.get('/calculateETB', function(req, res) {
	var objectId = req.query.objectId;
	var isWeather = req.query.isWeather;
	if (!isWeather || !objectId) {
		res.status(400).send();
	}

	etbCalculator.queryEvent(objectId, function(error, event) {
		if (error) {
			console.log(error);
			res.status(500).send();
		} else {
			if (isWeather==='true') { //Calculate ETB taking weather condition into consideration
				etbCalculator.calculateETBWithWeather(event, function(etb){
					res.send(etb);
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