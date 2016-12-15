/*eslint-env node */
//Request Module
var httpRequest = require('request');

//SVP Connection Credentials
var username = 'wim@antwerp.port.authority.be';
var password = 'wbid01bm';
var authData = "Basic " + new Buffer(username + ":" + password).toString("base64");
var svpQueryEventEndpoint = 'https://api.us.apiconnect.ibmcloud.com/aazraqegibmcom-svp-dev/chain2-catalog/SVPService/queryEvent';


//queries SVP for Event
exports.queryEvent = function(objectId, clientId, callback) {
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