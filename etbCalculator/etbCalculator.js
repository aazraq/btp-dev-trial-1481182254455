/*eslint-env node */
//Request Module
//Request Module
var httpRequest = require('request');

//Add Subtract Date Third Party Module
var addSubtractDate = require("add-subtract-date");

//SVP Connection Credentials --- NEEDS TO BE FROM VCAP
var username = 'wim@antwerp.port.authority.be';
var password = 'wbid01bm';
var authData = "Basic " + new Buffer(username + ":" + password).toString("base64");
var clientId = 'cb73fb49-b5ba-43cf-974c-47f10138d6f7';
var svpQueryEventEndpoint = 'https://api.us.apiconnect.ibmcloud.com/aazraqegibmcom-svp-dev/chain2-catalog/SVPService/queryEvent';

//Weather Company Endpoint
var weatherCompanyEndpoint = "https://5fc68d04-df6d-418d-8154-6abab22f5b12:T433d4vTeb@twcservice.mybluemix.net";

//A constant specifying the average time from Antwerp pilot station to terminal A
var AVERAGE_BERTHING_TIME = 2;

//queries SVP for Event
exports.queryEvent = function(objectId, callback) {
	var options = {
		url: svpQueryEventEndpoint+'?objectId=' + objectId,
		headers: {
			'Authorization': authData,
			'x-ibm-client-id': clientId
		}
	};
	httpRequest(
		options,
		function(error, response, body) {
			try {
				var json = JSON.parse(body);
				var event = json.Envelope.Body.queryResponse.events.event;
				callback(null, event);
			} catch (e) {
				callback(e, null);
			}
		}
	);
};

exports.calculateETB = function(event) {
	var eta = new Date(event.additionalInfo.$);
	var etb = addSubtractDate.add(eta, AVERAGE_BERTHING_TIME, "hours");
	return etb;
};

exports.calculateETBWithWeather = function(event, callback) {
	var eta = new Date(event.additionalInfo.$);
	var location = getLocation(event);
	getWeatherSpeedForecast(location, function(e, windSpeed) {
		var beaufortSpeed = convertMphToBeaufort(windSpeed);
		var etb = addSubtractDate.add(eta, AVERAGE_BERTHING_TIME * 60, "minutes");
		etb = addSubtractDate.add(etb, AVERAGE_BERTHING_TIME * beaufortSpeed * 0.05 * 60, "minutes");
		callback(etb);

	});
};

function getLocation(event) {
	var bizLocation = event.bizLocation.$;
	var location = {};
	if (bizLocation === "Antwerp pilot station") {
		location.latidude = 4.214625;
		location.longitude = 51.434853;
	}
	return location;
};

//Queries Weather Company for the forecast of the weather speed at the specified location
function getWeatherSpeedForecast(location, callback) {
	var options = {
		url: weatherCompanyEndpoint + '/api/weather/v1/geocode/' + location.latidude + '/' + location.longitude + '/forecast/hourly/48hour.json'
	};
	httpRequest(
		options,
		function(error, response, body) {
			try {
				var json = JSON.parse(body);
				var weatherSpeed = json.forecasts[0].wspd;
				convertMphToBeaufort(weatherSpeed);
				callback(null, weatherSpeed);
			} catch (e) {
				callback(e, null);
			}
		}
	);
};

//Convert miles per hour to Beaufort scale https://en.wikipedia.org/wiki/Beaufort_scale
function convertMphToBeaufort(windSpeed) {
	if (windSpeed < 1) {
		return 0;
	} else if (windSpeed <= 3) {
		return 1;
	} else if (windSpeed <= 7) {
		return 2;
	} else if (windSpeed <= 12) {
		return 3;
	} else if (windSpeed <= 18) {
		return 4;
	} else if (windSpeed <= 24) {
		return 5;
	} else if (windSpeed <= 31) {
		return 6;
	} else if (windSpeed <= 38) {
		return 7;
	} else if (windSpeed <= 46) {
		return 8;
	} else if (windSpeed <= 54) {
		return 9;
	} else if (windSpeed <= 63) {
		return 10;
	} else if (windSpeed <= 72) {
		return 11;
	} else {
		return 12;
	}
};