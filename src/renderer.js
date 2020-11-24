const Camera = require("./camera");
const config = require("../config.json");

function Renderer(canvas) {
	// Constants
	this.level_radius = config.consts.LEVEL_RADIUS; // Define level boundary
	// Canvas Setup
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	this.cam = new Camera(canvas);
	this.shadows = true;

	this.init = function() {
		// Event registration
		this.canvas.addEventListener("touchstart", this.touch_start, false);
		this.canvas.addEventListener("mousedown", this.mouse_down, false);
		this.canvas.addEventListener("DOMMouseScroll", this.mouse_scroll, false);
		this.canvas.addEventListener("mousewheel", this.mouse_scroll, false);
	};
	this.click_at_point = function(x, y) {
		if (!world.paused) {
			// Convert view coordinates (clicked) to world coordinates
			x = this.cam.viewport_to_world_x(x);
			y = this.cam.viewport_to_world_y(y);
			// Push player
			world.push_player_from(x, y);
		}
	};
	this.touch_start = ev => {
		ev.preventDefault(); // Prevent dragging
		const touch = ev.touches[0]; // Just pay attention to first touch
		renderer.click_at_point(touch.pageX, touch.pageY);
	};
	this.mouse_down = ev => {
		ev.preventDefault();
		if (ev.layerX || ev.layerX == 0) { // Firefox
			ev._x = ev.layerX;
			ev._y = ev.layerY;
		}
		else if (ev.offsetX || ev.offsetX == 0) { // Opera
			ev._x = ev.offsetX;
			ev._y = ev.offsetY;
		}
		renderer.click_at_point(ev._x, ev._y);
	};
	this.mouse_scroll = event => {
		let delta = 0;
		if (!event) event = window.event;
		// normalize the delta
		if (event.wheelDelta) {
			// IE and Opera
			delta = event.wheelDelta / 60;
		}
		else if (event.detail) {
			// W3C
			delta = -event.detail / 2;
		}
		delta = delta / Math.abs(delta);
		if (delta != 0) {
			world.user_did_zoom = true;
			if (delta > 0) renderer.cam.scale_target *= 1.2;
			if (delta < 0) renderer.cam.scale_target /= 1.2;
			const fit = Math.min(renderer.canvas.width, renderer.canvas.height);
			const max = fit / 4 / world.get_player().radius;
			const min = fit / 4 / renderer.level_radius;
			if (renderer.cam.scale_target > max) renderer.cam.scale_target = max;
			if (renderer.cam.scale_target < min) renderer.cam.scale_target = min;
		}
	};
	this.update = function() {
		// Canvas maintenance
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		// Background
		this.ctx.fillStyle = "#1D40B5"; // Surrounding color of canvas outside of the level
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.beginPath();
		this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.closePath();
		this.ctx.fill();
		// Level boundary
		this.ctx.fillStyle = "#2450E4"; // Background color of the level (inside the boundaries)
		this.ctx.beginPath();
		this.ctx.arc(this.cam.world_to_viewport_x(0), this.cam.world_to_viewport_y(0), Math.abs(this.level_radius * this.cam.scale), 0, Math.PI * 2, true);
		this.ctx.closePath();
		this.ctx.fill();
		if (this.shadows) {
			this.ctx.strokeStyle = "rgba(0,0,0,0.3)";
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.arc(this.cam.world_to_viewport_x(0) + 2, this.cam.world_to_viewport_y(0) + 4, this.level_radius * this.cam.scale, 0, Math.PI * 2, true);
			this.ctx.closePath();
			this.ctx.stroke();
		}
		this.ctx.strokeStyle = "#FFF";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.arc(this.cam.world_to_viewport_x(0), this.cam.world_to_viewport_y(0), this.level_radius * this.cam.scale, 0, Math.PI * 2, true);
		this.ctx.closePath();
		this.ctx.stroke();
		const player = world.get_player();
		for (let i = 0; i < world.cells.length; i++) {
			// If not the player, draw it now
			if (i != 0) {
				world.cells[i].draw(this.ctx, this.cam, this.shadows, player.radius);
			}
		}
		// Camera-track player
		this.cam.update(player.x_pos, player.y_pos, world.frame_delta);
		// Draw player
		player.draw(this.ctx, this.cam, this.shadows);
	}
	// Call init
	this.init();
}

module.exports = Renderer;
