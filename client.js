var io = require("socket.io-client");

var Single = require("./src/mode/single");
var Renderer = require("./src/renderer");
var MusicPlayer = require("./src/musicplayer");
var config = require("./config.json");

// Engine globals
var mspf = 1000 / config.fps;

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
	document.getElementById("single").disabled = false;
	document.getElementById("single").addEventListener("click", function() {
		document.getElementById("menu").style.display = "none";
		window.world = new Single();
		// Initialize the World
		world.load_level();

		// Animate!
		(function animloop() {
			if (world) world.update();
			requestAnimFrame(animloop);
		})();

		register();
	});
}

function register() {
	// Event registration
	window.addEventListener("blur", function() {
		world.pause(true);
	}, false);
	document.getElementById("help").addEventListener("click", function() {
		world.toggle_help();
	}, false);
	document.getElementById("mute").addEventListener("click", function() {
		music.mute();
	}, false);
	document.getElementById("quit").addEventListener("click", function() {
		world = null;
		document.getElementById("menu").style.display = "block";
	}, false);
	document.getElementById("newlevel").addEventListener("click", function() {
		world.load_level();
	}, false);
	document.getElementById("pause").addEventListener("click", function() {
		world.pause();
	}, false);
	document.getElementById("playbutton").addEventListener("click", function() {
		world.toggle_help();
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
}
