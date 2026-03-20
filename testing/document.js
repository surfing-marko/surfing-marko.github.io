document.addEventListener('DOMContentLoaded', function () 
{
surflyExtension.surflySession.onMessage.addListener((message) => 
	{
	if (message.event_type === "participant_joined") 
		{
			console.log("participant_joined - apply fileupload box control switching");
			surflyExtension.surflySession.apiRequest(
			{
				cmd: 'relocate',
				url: 'www.example.com',
				newTab: Boolean(newTab),
			});
			// Select or create the signature box
			var file_upload = document.getElementById("fileInput");
	
		// Add a click event listener to the file upload box
		file_upload.addEventListener("click", function ()
			{
				console.log("fileupload box was clicked!");
				surflyExtension.surflySession.apiRequest(
				{
					cmd: 'transfer_tab_control',
					to: 1
				});
			});
		// Set a timeout for 2 seconds to stop the agent hover over file upload
		file_upload.addEventListener("mouseenter", function () 
			{
				hoverTimeout = setTimeout(function ()
				{
					console.log("Mouse hovered over fileupload for more than 2 seconds");
					surflyExtension.surflySession.apiRequest(
						{
							cmd: 'transfer_tab_control',
							to: 1
						});
				},
				2000);
			});
		}
	}3);
});