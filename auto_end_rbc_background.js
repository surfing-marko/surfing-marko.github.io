/*━━━━━━━━━━━━━━━━━━━[ CONFIG ]━━━━━━━━━━━━━━━━━━━*/

const AUTO_END_SECONDS = 30; // hard timeout, regardless of conditions

/*━━━━━━━━━━━━━━━━━━━[ CORE LOGIC ]━━━━━━━━━━━━━━━━━━━*/

// Poll until Surfly session is available, then start timer
const initInterval = setInterval(() => {
	try {
		if (browser && browser.webfuseSession) {
			console.log("Timeout checker started, Surfly session detected.");

			// Stop polling
			clearInterval(initInterval);

			// Schedule hard end after AUTO_END_SECONDS
			setTimeout(() => {
				console.log(`⏱️ Auto-ending session after ${AUTO_END_SECONDS} seconds`);
				browser.webfuseSession.apiRequest({ cmd: "end" });
			}, AUTO_END_SECONDS * 1000);
		} else {
			console.log("Waiting for Surfly session to be available…");
		}
	} catch (e) {
		console.error("Error while checking Surfly session:", e);
	}
}, 10000); // check every 10 seconds