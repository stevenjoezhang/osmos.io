/* global $ */

var World = require("./src/World");
var config = require("./config.json");

// Engine globals
var mspf = 1000 / config.fps;

// Setup function called when page loads
window.onload = function() {
	var canvas = document.getElementById("canvas");

	// Game globals
	window.world = new World(canvas);
	// Initialize the World
	world.load_level();
	// If we're just now starting the game
	if (!world.has_started) {
		world.music.play_song();
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
