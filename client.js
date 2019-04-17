/* global $ */

var World = require("./src/World");
var config = require("./config.json");

// Engine globals
var mspf = 1000 / config.fps;

// Setup function called when page loads
window.onload = function() {
	var canvas = document.getElementById("canvas");
	if (canvas.getContext) {
		// Game globals
		window.world = new World(canvas);
		// Initialize the World
		world.load_level();

		// Create requestAnimFrame if it doesn't exist
		window.requestAnimFrame = (function() {
			return window.requestAnimationFrame    || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(/* function */ callback, /* DOMElement */ element) {
					window.setTimeout(callback, mspf);
				};
		})();

		// Animate!
		(function animloop() {
			world.update();
			requestAnimFrame(animloop, canvas);
		})();
	}
}
