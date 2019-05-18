var io = require("socket.io-client");

var Single = require("./src/mode/single");
var Multi = require("./src/mode/player");
var God = require("./src/mode/god");

var Renderer = require("./src/renderer");
var MusicPlayer = require("./src/musicplayer");
var config = require("./config.json");

// Engine globals
var mspf = 1000 / config.fps;
window.world = null;

// Create requestAnimFrame if it doesn't exist
window.requestAnimFrame = window.requestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.oRequestAnimationFrame
|| window.msRequestAnimationFrame
|| function(callback) { window.setTimeout(callback, mspf) };

// Setup function called when page loads
window.onload = function() {
	var canvas = document.getElementById("canvas");

	// Game globals
	window.renderer = new Renderer(canvas);
	window.music = new MusicPlayer(
		[
			["music/Pitx_-_Black_Rainbow.ogg", "Black Rainbow", "Pitx"],
			["music/rewob_-_Circles.ogg", "Circles", "rewob"],
			["music/FromSummertoWinter-Ghidorah.mp3", "From Summer to Winter", "Ghidorah"],
			["music/Biosphere-Antennaria.ogg", "Biosphere", "Antennaria"],
			["music/JulienNeto-FromCoverToCover.ogg", "FromCoverToCover", "Julien Neto"],
			["music/VincentAndTristan_OsmosTheme1.ogg", "Osmos Theme 1", "Vincent And Tristan"],
			["music/VincentAndTristan_OsmosTheme2.ogg", "Osmos Theme 2", "Vincent And Tristan"],
			["music/HighSkies-ShapeOfThingsToCome.ogg", "Shape Of Things To Come", "High Skies"],
			["music/Loscil-Rorschach.ogg", "Rorschach", "Loscil"]
		], {
			"blip": ["fx/blip.ogg"],
			"win": ["fx/win.ogg"],
			"death": ["fx/death.ogg"],
			"bounce": ["fx/bounce.ogg"],
		});

	music.init();
	music.play_song();

	register();

	fetch("/port").then(response => {
		return response.text();
	}).then(data => {
		var port = data;
		var socket = io("//" + window.location.hostname + ":" + port, {
			forceNew: true,
			upgrade: false,
			transports: ["websocket"]
		});
		socket.on("connect", function() {
			socket.emit("pings");
		});
		socket.on("pongs", function() {
			socket.disconnect();
			document.getElementById("error").innerText = "All done, have fun!";
			document.getElementById("multi").disabled = false;
			document.getElementById("spectate").disabled = false;
		});
		socket.on("connect_error", function() {
			document.getElementById("error").innerText = "Cannot connect with server. This probably is due to misconfigured proxy server. (Try using a different browser)";
		});
		document.getElementById("multi").addEventListener("click", function() {
			return alert("多人对战还未完成，请点击`Single Player`！");
			document.getElementById("menu").style.display = "none";
			world = new Multi();
			// Initialize the World
			world.load_level();

			// Animate!
			(function animloop() {
				if (world) world.update();
				requestAnimFrame(animloop);
			})();
		});
	});

	document.getElementById("single").disabled = false;
	document.getElementById("single").addEventListener("click", function() {
		document.getElementById("menu").style.display = "none";
		world = new Single();
		// Initialize the World
		world.load_level();

		// Animate!
		(function animloop() {
			if (world) world.update();
			requestAnimFrame(animloop);
		})();
	});
}

window.controls = {
	help: function() {
		if (world) world.toggle_help();
	},
	mute: function() {
		if (music) music.mute();
	},
	quit: function() {
		if (world) world = null;
		document.getElementById("menu").style.display = "block";
	},
	newlevel: function() {
		if (world) world.load_level();
	},
	pause: function(flag) {
		if (world) world.pause(flag);
	}
}

function register() {
	// Event registration
	window.addEventListener("blur", function() {
		controls.pause(true);
	}, false);
	document.getElementById("playbutton").addEventListener("click", function() {
		controls.help();
		// Play a sound in order to allow any sound playback at all on iOS
		music.play_sound("win");
	}, false);
	window.addEventListener("keydown", function(e) {
		var code;
		if (!e) var e = window.event;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		switch (code) {
			case 72: // H
				controls.help();
				break;
			case 77: // M
				controls.mute();
				break;
			case 78: // N
				music.next_song();
				break;
			case 32: // Space
			case 80: // P
				controls.pause();
				break;
			case 82: // R
				controls.newlevel();
				break;
			case 83: // S
				world.shadows = !world.shadows;
				break;
		}
	}, false);
	document.getElementById("messages").addEventListener("click", function() {
		switch (document.getElementById("messages").className) {
			case "paused":
				controls.pause();
				break;
			case "death":
			case "warning":
			case "success":
				controls.newlevel();
				break;
			default:
				break;
		}
	}, false);
}
