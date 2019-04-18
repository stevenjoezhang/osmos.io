function Control() {
	// Methods
	this.init = function() {
		// Event registration
		window.addEventListener("keydown", this.key_down, false);
		window.addEventListener("blur", function() {
			world.pause(true);
		}, false);
		document.getElementById("mute").addEventListener("click", function() {
			music.mute();
		}, false);
		document.getElementById("newlevel").addEventListener("click", function() {
			world.load_level();
		}, false);
		document.getElementById("pause").addEventListener("click", function() {
			world.pause();
		}, false);
		document.getElementById("help").addEventListener("click", function() {
			world.toggle_help();
		}, false);
		document.getElementById("messages").addEventListener("click", function() {
			switch (document.getElementById("messages").className) {
				case "paused":
					world.pause();
					break;
				case "death":
				case "warning":
				case "success":
					world.load_level();
					break;
				default:
					break;
			}
		}, false);
		document.getElementById("playbutton").addEventListener("click", function() {
			world.toggle_help();
			// Play a sound in order to allow any sound playback at all on iOS
			music.play_sound("win");
		}, false);
	};
	this.key_down = function(e) {
		var code;
		if (!e) var e = window.event;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		switch (code) {
			case 72: // H
				world.toggle_help();
				break;
			case 77: // M
				music.mute();
				break;
			case 78: // N
				music.next_song();
				break;
			case 32: // Space
			case 80: // P
				world.pause();
				break;
			case 82: // R
				world.load_level();
				break;
			case 83: // S
				world.shadows = !world.shadows;
				break;
		}
	};
	// Call init
	this.init();
}

module.exports = Control;
