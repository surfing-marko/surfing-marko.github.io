Content Script
console.log("Extension loaded");
console.log("Extension loaded on domain:", window.location.hostname);

// Send current URL to background (for popup use)
document.addEventListener("DOMContentLoaded", () => {
	const currentUrl = window.location.href;
	try {
		browser.runtime.sendMessage({
			target: "background",
			action: "provide_current_url",
			from: "content",
			url: currentUrl
		});
		console.log("Sent current URL to background:", currentUrl);
	} catch (e) {
		console.error("Failed to send URL to background:", e);
	}
});

// Define domains
const testDomains = [
	"altshulershaham-dev.outsystemsenterprise.com",
	"altshulershaham-tst.outsystemsenterprise.com"
];

// Identify current environment
const isTestEnv = testDomains.includes(window.location.hostname);

// 🟡==================[ Test Environment ]==================
if (isTestEnv) {

	// (keep your test environment logic here — unchanged)

// 🔵==================[ Production Environment ]==================
} else {
	console.log("Running in PRODUCTION environment");

	// All production-specific code goes here (currently same as test)
	document.addEventListener('DOMContentLoaded', function () {
		const timeout = 5000;
		const startTime = Date.now();

		function initializeFeatures() {
			if (!browser || !browser.webfuseSession) {
				console.error('Surfly session is not initialized');
				return;
			}

			const marketerInControlEvent = new CustomEvent('MarketerInControl');
			console.log('Dispatching MarketerInControl event on first load');
			document.dispatchEvent(marketerInControlEvent);

			browser.webfuseSession.onMessage.addListener((message) => {
				if (message.event_type === "tab_control") {
					console.log("tab_control", message);

					if (message.controlIndex === message.leaderIndex) {
						console.log("Marketer (Agent) is in control");
						const marketerInControlEvent = new CustomEvent('MarketerInControl');
						console.log('Dispatching MarketerInControl event');
						document.dispatchEvent(marketerInControlEvent);
					} else {
						console.log("Customer is in control");
						const customerInControlEvent = new CustomEvent('CustomerInControl');
						console.log('Dispatching CustomerInControl event');
						document.dispatchEvent(customerInControlEvent);
					}
				}
			});
		}

		const intervalId = setInterval(() => {
			if (Date.now() - startTime >= timeout) {
				clearInterval(intervalId);
				console.log('Timeout reached, surfly session not initialized');
			} else {
				initializeFeatures();
			}
		}, 100);
	});
}

Background Script
/*━━━━━━━━━━━━━━━━━━━[ ADJUST CONFIGURATION: START ]━━━━━━━━━━━━━━━━━━━*/

// Time in seconds with no primary participant before session ends (multiple of 5)
const max_no_participant_time = 60;

// Domains used for TEST environments
const testDomains = [
  "altshulershaham-dev.outsystemsenterprise.com",
  "altshulershaham-tst.outsystemsenterprise.com"
];

/*━━━━━━━━━━━━━━━━━━━[ ADJUST CONFIGURATION: END ]━━━━━━━━━━━━━━━━━━━*/


/*━━━━━━━━━━━━━━━━━━━[ BASE SETUP – DO NOT EDIT BELOW ]━━━━━━━━━━━━━━━━━━━*/

console.log("Participant checker loaded");

let lastDetectedTime = Date.now();
let currentUrl = ""; // will be filled by content script

/*━━━━━━━━━━━━━━━━━━━[ CORE: PRODUCTION + TEST LOGIC ]━━━━━━━━━━━━━━━━━━━*/

// ── Function: get session participants (production logic) ──
function getSessionParticipants() {
  console.log('Making API request to check participants');
  browser.webfuseSession.apiRequest({
	cmd: 'get_session_participants',
  });
}

// ── Handle responses from API (production logic) ──
browser.webfuseSession.onMessage.addListener((message) => {
  if (message.msg === "get_session_participants") {
	console.log("Session participants:", message);

	// Check if a participant with client_index 0 is online
	const isPrimaryParticipantOnline = message.participants.some(
	  participant => participant.client_index === 0 && participant.online
	);

	if (isPrimaryParticipantOnline) {
	  lastDetectedTime = Date.now();
	  console.log("✅ Primary participant detected. Timer reset.");
	} else {
	  console.log("⚠️ No primary participant detected.");
	}
  }
});

// ── Function: check elapsed time since last detection (production logic) ──
function checkParticipantStatus() {
  const timeSinceLastDetected = (Date.now() - lastDetectedTime) / 1000; // seconds

  if (timeSinceLastDetected >= max_no_participant_time) {
	console.log("❌ No primary participant detected for threshold. Ending session.");
	browser.webfuseSession.apiRequest({ cmd: 'end' });
  } else {
	console.log(`⏱️ Time since last detection: ${timeSinceLastDetected}s`);
  }
}

// ── Run timers for production logic ──
setInterval(getSessionParticipants, 5000);
setInterval(checkParticipantStatus, 1000);


/*━━━━━━━━━━━━━━━━━━━[ CUSTOM URL COMMUNICATION – SHARED LOGIC ]━━━━━━━━━━━━━━━━━━━*/

// Sends current URL to popup
function provideUrlPopup() {
  console.log("Sending current URL to popup:", currentUrl);
  browser.runtime.sendMessage({
	target: "popup",
	action: "update_current_url",
	url: currentUrl
  });
}

// Receives current URL from content script
browser.runtime.onMessage.addListener(message => {
  console.log("Message received in background script:", message);

  if (message.action === "provide_current_url" && message.from === "content") {
	currentUrl = message.url;
	provideUrlPopup();

	try {
	  const domain = new URL(currentUrl).hostname.replace(/^www\./, '');
	  const isTest = testDomains.includes(domain);

	  /*━━━━━━━━━━━━━━━[ TEST LOGIC ]━━━━━━━━━━━━━━━*/
	  if (isTest) {
		console.log("🧪 Test environment detected:", domain);
		// Add any test-specific behavior here
		// e.g. disable session end or mock API behavior
		return;
	  }

	  /*━━━━━━━━━━━━━━━[ PRODUCTION LOGIC ]━━━━━━━━━━━━━━━*/
	  console.log("🌐 Production environment detected:", domain);
	  // Everything else continues normally (timers already running)
	} catch (e) {
	  console.error("Invalid URL received:", currentUrl);
	}
  }
});

Popup HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload File</title>
  <style>
	/* ========== Global Styles ========== */
	body {
	  margin: 0;
	  font-family: 'Neue Helvetica Condensed 47 Light', 'NarkisBlockCon-Thin_MFW', sans-serif, arial;
	}

	/* ========== Production Popup Layout ========== */
	.popup {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100vw;
	  height: 100vh;
	  display: flex;
	  justify-content: center;
	  align-items: center;
	}

	.popup-content {
	  background-color: #fff;
	  width: 100%;
	  height: 100%;
	  padding: 5%;
	  border-radius: 10px;
	  text-align: center;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  gap: 1rem;
	  box-sizing: border-box;
	}

	.explanation {
	  font-size: 1rem;
	  margin: 0;
	  color: #333;
	  word-wrap: break-word;
	}

	.upload-btn {
	  padding: 0.8rem 1.5rem;
	  font-size: 1rem;
	  background-color: #007348;
	  color: #E9E9E9;
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	  transition: background-color 0.3s ease;
	  width: 100%;
	}

	.upload-btn:hover {
	  background-color: #006051;
	}

	/* ========== Test Layout ========== */
	.test-message {
	  font-size: 2rem;
	  color: #007348;
	  text-align: center;
	  margin-top: 40vh;
	}
  </style>
</head>

<body>
  <!-- Root container (we dynamically replace its content based on environment) -->
  <div id="popup-root">
	<!-- ========== PRODUCTION CONTENT (default) ========== -->
	<div class="popup">
	  <div class="popup-content">
		<p class="explanation">
		  Please upload your file here. Your agent will then add your file to the application.
		</p>
		<input type="file" id="fileInput" style="display: none" onchange="handleFileSelect(event)">
		<button class="upload-btn" id="fileupload" onclick="document.getElementById('fileInput').click()">
		  Upload File
		</button>
	  </div>
	</div>
  </div>

  <script>
	/* ========== Environment Configuration ========== */
	const testDomains = [
	  "altshulershaham-dev.outsystemsenterprise.com",
	  "altshulershaham-tst.outsystemsenterprise.com"
	];

	/* ========== Production Logic ========== */
	function handleFileSelect(event) {
	  const file = event.target.files[0];
	  if (file) {
		browser.webfuseSession.apiRequest({
		  cmd: 'upload_file',
		  file: file,
		});
	  }
	}

	/* ========== Message Handling (From Background) ========== */
	browser.runtime.onMessage.addListener(message => {
	  if (message.target === "popup" && message.action === "update_current_url") {
		console.log("Popup received URL:", message.url);

		try {
		  const urlObj = new URL(message.url);
		  const domain = urlObj.hostname.replace(/^www\./, '');
		  const root = document.getElementById("popup-root");

		  // ---------- TEST ENVIRONMENT ----------
		  if (testDomains.includes(domain)) {
			console.log("Test domain detected:", domain);
			root.innerHTML = `<h1 class="test-message">Hello World</h1>`;
		  }

		  // ---------- PRODUCTION ENVIRONMENT ----------
		  else {
			console.log("Production domain detected:", domain);
			// Default production content is already rendered in HTML
		  }

		} catch (e) {
		  console.error("Invalid URL received:", message.url);
		}
	  }
	});
  </script>
</body>
</html>