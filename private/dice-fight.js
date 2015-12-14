var request = require( 'request' );

module.exports = {
	createNewFight: createNewFight
};

var fightStaggerTime = 1500;
var returnUrl = "https://hooks.slack.com/services/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";

function createNewFight() {
	console.log( "createNewFight" );
	var fighter1 = null,
	    fighter2 = null,
	    lastRoll = 100,
	    turn     = 1;

	function fight() {
		console.log( 'fight!' );
		// Roll based on last dice result
		var roll = Math.floor( Math.random() * (lastRoll - 1) ) + 1;

		// Get the name right
		var fighter = turn == 1 ? fighter1 : fighter2;
		// Toggle turn
		turn = turn == 1 ? 2 : 1;

		var gameEnder = roll == 1 ? '\nAND DIES HORRIBLY!' : '';
		var payload = {
			username   : "Team Serious Bot",
			channel    : "#fight-room",
			attachments: [{
				fallback : fighter.toUpperCase() + " rolls from " + lastRoll + " and gets a *" + roll + "*!" + gameEnder,
				title    : 'DICE FIGHT!',
				color    : 'danger',
				text     : fighter.toUpperCase() + " rolls from " + lastRoll + " and gets a *" + roll + "*!" + gameEnder,
				mrkdwn_in: ['text']
			}]
		};
		// Announce result of roll to chat
		sendUpdate( payload );
		// Update last roll
		lastRoll = roll;
		// Continue if no one lost
		if( lastRoll != 1 ) {
			setTimeout( fight, fightStaggerTime );
		}
	}

	function addFighter( name ) {
		console.log( "addFighter" );
		// First fighter
		if( fighter1 === null ) {
			fighter1 = name;
			console.log( 'first fighter added, announcing challenge!' );
			sendOpenChallenge( fighter1 );
		}
		// Ignore duplicate fighter
		else if( fighter1 === name ) {
			var payload = {
				username   : "Team Serious Bot",
				channel    : "#fight-room",
				attachments: [{
					fallback : name.toUpperCase() + " tried to fight themself like an *idiot*!",
					title    : 'DICE FIGHT!',
					color    : 'warning',
					text     : name.toUpperCase() + " tried to fight themself like an *idiot*!",
					mrkdwn_in: ['text']
				}]
			};
			sendUpdate( payload );
			return false;
		}
		// Second fighter, go!
		else if( fighter2 === null ) {
			fighter2 = name;
			console.log( 'second fighter added, starting fight!' );
			fight();
			return true;
		}
		return false;
	}

	return {
		addFighter     : addFighter,
		getFirstFighter: function() {
			console.log( "getFirstFighter" );
			return fighter1;
		}
	};
}

function sendUpdate( payload ) {
	console.log( "sendUpdate" );
	var postOpts = {
		url : returnUrl,
		body: JSON.stringify( payload )
	};
	request.post( postOpts, function( err, res, body ) {
		console.log( "Response sent! - " + body );
	} );
}

function sendOpenChallenge( name ) {
	console.log( "sendOpenChallenge" );

	var payload = {
		username   : "Team Serious Bot",
		channel    : "#fight-room",
		attachments: [{
			fallback : name.toUpperCase() + " has issued an open dicefight challenge! Type */dicefight* to accept!\n",
			title    : 'DICE FIGHT!',
			color    : 'danger',
			text     : name.toUpperCase() + " has issued an open dicefight challenge! Type */dicefight* to accept!\n",
			image_url: 'http://i.imgur.com/sNMLdZ2.png',
			mrkdwn_in: ['text']
		}]
	};

	sendUpdate( payload );
}