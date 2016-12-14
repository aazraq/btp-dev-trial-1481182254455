/*eslint-env node */
//Request Module
var httpRequest = require('request');

//Add Subtract Date Third Party Module
var addSubtractDate = require("add-subtract-date");

//A constant specifying the average time from Antwerp pilot station to terminal A
var AVERAGE_BERTHING_TIME = 2;


//Calculate Estimated Time of Berthing
exports.calculateETB = function(event) {
	var eta = new Date(event.additionalInfo.$);
	var etb = addSubtractDate.add(eta, AVERAGE_BERTHING_TIME, "hours");
	return etb;
};
