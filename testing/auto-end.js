(function (s, u, r, f, l, y) {
	s[f] = s[f] || { init: function () { s[f].q = arguments } };
	l = u.createElement(r); y = u.getElementsByTagName(r)[0]; l.async = 1;
	l.src = 'https://surfly.com/surfly.js'; y.parentNode.insertBefore(l, y);
})(window, document, 'script', 'Surfly');
//Required variables
let inactivitySeconds = 15000;
let SurflySession;
let participantJoined = false;
let settings = {
	"widget_key": "4e3d97b9f9c549b798eb8735a4b7c619"
};

//Load Surfly JS library here


Surfly.init(settings, function (init) {
	if (init.success && !Surfly.isInsideSession) {
		console.log("init success");
		SurflySession = Surfly.session().create()

			//Use session created event to trigger startLeader
			.on("session_created", function (session, event) {
				SurflySession.startLeader();
			})

			//Use session started event to begin inactivity timer
			.on("session_started", function (session, event) {
				console.log("Session has started");
				(async () => {
					for (let i = 10; i > 0; i--) {
						console.log(`Waiting for participant: ${i} seconds remaining`);
						await new Promise(resolve => setTimeout(resolve, 10000));
						if (participantJoined === true) {
							console.log('Participant has joined.');
						} else {
							console.log("Session ended due no other participants joined within 10 seconds");
							SurflySession.end();
						}
					}
				})();
			})


			//use user activity event to reset activity timer
			.on("user_activity", function (session, event) {
				if (session.inactivityTimeout) {
					console.log("inactivity count reset");
					clearTimeout(session.inactivityTimeout);
				}
				session.inactivityTimeout = setTimeout(function () {
					console.log("Session ended due to ${inactivitySeconds} seconds of inactivity");
					SurflySession.end();
				}, inactivitySeconds);
			})

			//use participant joined event to update the participant joined variable used in the timeout function
			.on('participant_joined', function (session, event) {
				console.log('Participant ', event.clientIndex, 'joined the session');
				//use client index as a condition here if you want to ensure specific participants
				participantJoined = true;
			})
	}
});


(function (s, u, r, f, l, y) {
	s[f] = s[f] || { init: function () { s[f].q = arguments } };
	l = u.createElement(r); y = u.getElementsByTagName(r)[0]; l.async = 1;
	l.src = 'https://surfly.com/surfly.js'; y.parentNode.insertBefore(l, y);
})(window, document, 'script', 'Surfly');
var SurflySession;
var participantJoined = false;
var settings = {
	"widget_key": "4e3d97b9f9c549b798eb8735a4b7c619",
	"end_redirect_enabled": false,
	"block_until_agent": false
};
Surfly.init(settings, function (init) {
	if (init.success && !Surfly.isInsideSession) {
		console.log("init success");
		SurflySession = Surfly.session().create()
			.on("session_created", function (session, event) {
				SurflySession.startLeader();
			})
			.on("session_started", function (session, event) {
				console.log("Session has started");
				(async () => {
					for (let i = 10; i > 0; i--) {
						console.log(`Waiting for participant: ${i} seconds remaining`);
						await new Promise(resolve => setTimeout(resolve, 10000));
						if (participantJoined === true) {
							console.log('Participant has joined.');
							return;
						} else {
							SurflySession.end('http://bing.com');
							console.log("Session ended due no other participants joined within 10 seconds");
						}
					}
				})();
			})
			.on("user_activity", function (session, event) {
				if (session.inactivityTimeout) {
					clearTimeout(session.inactivityTimeout);
				}
				if (session.inactivityInterval) {
					clearInterval(session.inactivityInterval);
				}
				let inactivitySeconds = 15;
				console.log(`Inactivity: ${inactivitySeconds} seconds remaining`);
				session.inactivityInterval = setInterval(function () {
					inactivitySeconds--;
					if (inactivitySeconds > 0) {
						console.log(`Inactivity: ${inactivitySeconds} seconds remaining`);
					}
				}, 1000);
				session.inactivityTimeout = setTimeout(function () {
					clearInterval(session.inactivityInterval);
					console.log("Session ended due to 15 second inactivity");
					SurflySession.end();
				}, 15000);
			})
			.on('participant_joined', function (session, event) {
				console.log('Participant ', event.clientIndex, 'joined the session');
				participantJoined = true;
			})
	}
});