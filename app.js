let SurflySession;

// Initialize Surfly
function initializeSurfly() {
    (function (s, u, r, f, l, y) {
        s[f] = s[f] || { init: function () { s[f].q = arguments } };
        l = u.createElement(r);
        y = u.getElementsByTagName(r)[0];
        l.async = 1;
        l.src = 'https://surfly.com/surfly.js';
        y.parentNode.insertBefore(l, y);
    })(window, document, 'script', 'Surfly');
}

// Show PIN popup
function showPopupPin() {
    const popup = document.getElementById("popup-pin");
    popup.classList.add("show");
    popup.showModal();
}

// Hide PIN popup
function hidePopupPin() {
    const popup = document.getElementById("popup-pin");
    popup.classList.remove("show");
    popup.close();
}

// Start co-browsing session
function startCorowsing() {
    initializeSurfly();
    
    const settings = {
        widget_key: "4e3d97b9f9c549b798eb8735a4b7c619",
        block_until_agent_joins: false,
        session_autorestore_enabled: false
    };

    Surfly.init(settings, function (init) {
        if (init.success && !Surfly.isInsideSession) {
            console.log("Surfly initialized successfully");
            
            SurflySession = Surfly.session().startLeader()
                .on("session_created", function (session) {
                    const sessionPin = session.pin;
                    console.log("Session PIN:", sessionPin);
                    document.getElementById("popup-pin-code").textContent = sessionPin;
                    showPopupPin();
                })
                .on("session_loaded", function () {
                    console.log("Session loaded");
                })
                .on("participant_joined", function () {
                    console.log("Participant joined");
                    SurflySession.relocate("https://www.rbc.com", false);
                    hidePopupPin();
                });
        }
    });
}

// End co-browsing session
function endSession() {
    if (SurflySession) {
        SurflySession.end();
    }
    hidePopupPin();
} 