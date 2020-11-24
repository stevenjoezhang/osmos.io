const config = require("../config.json");

module.exports = function(canvas) {
	// Constants
	this.scale_smoothness = 0.3;
	this.move_smoothness = 0.3;
	this.level_size = config.consts.LEVEL_SIZE; // Just a default; Will be set in load_level
	// Variables
	this.canvas = canvas;
	this.x = 0;
	this.y = 0;
	this.x_target = 0;
	this.y_target = 0;
	this.scale = 0.5;
	this.scale_target = 1;
	// Methods
	this.world_to_viewport_x = function(x) {
		return (x * this.scale) + (this.canvas.width / 2) - (this.x * this.scale);
	};
	this.world_to_viewport_y = function(y) {
		return (y * this.scale) + (this.canvas.height / 2) - (this.y * this.scale);
	};
	this.viewport_to_world_x = function(x) {
		return (x + (this.x * this.scale) - (this.canvas.width / 2)) / this.scale;
	};
	this.viewport_to_world_y = function(y) {
		return (y + (this.y * this.scale) - (this.canvas.height / 2)) / this.scale;
	};
	this.update = function(target_x, target_y, frame_delta) {
		this.x_target = target_x;
		this.y_target = target_y;
		// Gently move to target
		if (this.scale != this.scale_target) this.scale = Math.abs(this.scale + (frame_delta * (this.scale_target - this.scale) * this.scale_smoothness));
		if (this.x != this.x_target) this.x += frame_delta * (this.x_target - this.x) * this.move_smoothness;
		if (this.y != this.y_target) this.y += frame_delta * (this.y_target - this.y) * this.move_smoothness;
	};
	this.center = function() {
		// Center camera over level
		if (this.x == 0 && this.y == 0) {
			this.x = this.level_size / 2;
			this.y = this.level_size / 2;
		}
		this.x_target = this.x;
		this.y_target = this.y;
		this.zoom_to_player();
	};
	this.zoom_to_player = function() {
		// Scale 1x looks best when player radius is 40
		this.scale_target = this.level_size / 10 / world.get_player().radius;
	};
}
