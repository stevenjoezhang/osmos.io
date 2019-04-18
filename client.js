var io = require("socket.io-client");

var World = require("./src/mode/player");
var Renderer = require("./src/renderer");
var MusicPlayer = require("./src/musicplayer");
var Control = require("./src/control");
var config = require("./config.json");

// Engine globals
var mspf = 1000 / config.fps;

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
	window.control = new Control();
	window.world = new World();
	// Initialize the World
	world.load_level();
	// If we're just now starting the game
	if (!world.has_started) {
		music.init();
		music.play_song();
		world.has_started = true;
	}

	// Create requestAnimFrame if it doesn't exist
	window.requestAnimFrame = window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(callback, element) { window.setTimeout(callback, mspf) };

	// Animate!
	(function animloop() {
		world.update();
		requestAnimFrame(animloop, canvas);
	})();
}
