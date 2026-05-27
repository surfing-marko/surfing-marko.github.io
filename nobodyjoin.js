	(function (s, u, r, f, l, y) {
	s[f] = s[f] || { init: function () { s[f].q = arguments } };
	l = u.createElement(r); y = u.getElementsByTagName(r)[0]; l.async = 1;
	l.src = 'https://surfly.com/surfly.js'; y.parentNode.insertBefore(l, y);
	}) (window, document, 'script', 'Surfly');
	
	var SurflySession;
	var participantJoined = false;
	
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
				await new Promise(resolve => setTimeout(resolve, 120000));
				if (participantJoined === true) {
					console.log('Participant has joined.');
				} else {
					SurflySession.end();
					console.log("Session ended due no other participants joined within 2 minutes");
				}
			})();
		})
		.on('participant_joined', function (session, event) {
			console.log('Participant ', event.clientIndex, 'joined the session');
			participantJoined = true;
		}) 
	}
});