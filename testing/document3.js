document.addEventListener('DOMContentLoaded', function () 
	{
	console.log("Extension loaded successfully");
	if (message.event_type === "participant_joined")
		{
		console.log("New participant has joined");
		}
	}
);

surflyExtension.surflySession.apiRequest({
    cmd: 'open_tab',
    url,
});