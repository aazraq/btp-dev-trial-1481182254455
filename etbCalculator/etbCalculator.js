/*eslint-env node */
//Request Module
var httpRequest = require('request');

//Add Subtract Date Third Party Module
var addSubtractDate = require("add-subtract-date");

//SVP Connection Credentials
var username = 'wim@antwerp.port.authority.be';
var password = 'wbid01bm';
var authData = "Basic " + new Buffer(username + ":" + password).toString("base64");
var clientId = 'cb73fb49-b5ba-43cf-974c-47f10138d6f7';

//A constant specifying the average time from Antwerp pilot station to terminal A
var AVERAGE_BERTHING_TIME = 2;

//queries SVP for Event
exports.queryEvent = function(objectId, callback) {
	var options = {
		url: 'https://api.us.apiconnect.ibmcloud.com/aazraqegibmcom-svp-dev/chain2-catalog/SVPService/queryEvent?objectId=' + objectId,
		headers: {
			'Authorization': authData,
			'x-ibm-client-id': clientId
		}
	};
	httpRequest(
		options,
		function(error, response, body) {
			try {
				console.log("body");
				console.log(body);

				var json = JSON.parse(body);
				var event = json.Envelope.Body.queryResponse.events.event;
				callback(null, event);
			} catch (e) {
				callback(e, null);}
		}
	);
};

exports.calculateETB = function(event) {
	var eta = new Date(event.additionalInfo.$);
	var etb = addSubtractDate.add(eta, AVERAGE_BERTHING_TIME, "hours");
	return etb;
};