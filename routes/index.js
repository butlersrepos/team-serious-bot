var DiceFight = require('../private/dice-fight');
var express = require('express');
var router = express.Router();
var request = require('request');

var currentFight = null;

/* GET home page. */
router.post('/slack-bot/dicefight', function(req, res, next) {	
	var name = req.body.user_name
	if( currentFight == null ) {
		console.log("current fight is null, making new");
		currentFight = DiceFight.createNewFight();
		console.log("trying to add first fighter");
		currentFight.addFighter( name );
	} else {
		console.log("trying to add second fighter");
		var success = currentFight.addFighter( name );
		currentFight = success ? null : currentFight;
	}	
});

router.post('/slack-bot/roll', function(req, res, next) {
	console.log("req body - " + JSON.stringify(req.body));
	var user = req.body.user_name;
	var channel = req.body.channel_name;
	var textUsed = req.body.text;
    var returnUrl = "https://hooks.slack.com/services/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"
	var retVal = {
		payload: {
			username: "Team Serious Bot"
		}
	};
	
	// Setup initial echo of command received
	retVal.payload.text = user + " tried to roll " + textUsed + ".\n";
	
    if( req.body.text.split("d").length < 2 ) { 
		retVal.payload.text += "Invalid dice parameters, you must be stupid or something. Use XdY where X and Y are positive, non-zero numbers... idiot."; 
	} else {
		var numberOfDice = req.body.text.split("d")[0];
		var sizeOfDice = req.body.text.split("d")[1];
		if( numberOfDice < 1 || sizeOfDice < 1 ) {
			retVal.payload.text += "POSITIVE. NON. ZERO. NUMBERS. Get it right numbnuts!";
		} else {
			var total = 0;
			for( var i = 0; i < numberOfDice; i++ ) {
				var roll = Math.ceil(Math.random() * sizeOfDice);
				retVal.payload.text += ""+roll;
				if( i < numberOfDice - 1 ) { retVal.payload.text += " + "; }
				total += roll;
			}
			retVal.payload.text += " = " + total + "!";
		}
	}
	var postOpts = { 
		url: returnUrl, 
		body: JSON.stringify(retVal.payload)
	};
	request.post(postOpts, function(err, res, body) {
		console.log("Response sent! - " + body);
	});	
});

module.exports = router;

