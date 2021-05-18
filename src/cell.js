import config from "../config.js";

// Super-"class" of Ball and Player
// Handles physical attributes and actions
function Cell(xpos, ypos, radius) {
	// Variables to hold size
	this.radius = 20;
	// Variables to hold current position
	this.x_pos = 0;
	this.y_pos = 0;
	// Variables to hold current velocity
	this.x_veloc = 0;
	this.y_veloc = 0;
	// Speed limits
	this.x_veloc_max = 100;
	this.y_veloc_max = 100;
	// Variables to hold x position bounds
	this.x_min = 0;
	this.x_max = 640;
	this.friction = config.consts.FRICTION;
	// Methods
	this.horizontalBounce = function() {
		this.x_veloc = -this.x_veloc;
	};
	this.verticalBounce = function() {
		this.y_veloc = -this.y_veloc;
	};
	this.distance_from = function(other) {
		const dx = this.x_pos - other.x_pos;
		const dy = this.y_pos - other.y_pos;
		return Math.hypot(dx, dy);
	}
	this.collides_with = function(other) {
		return this.distance_from(other) < this.radius + other.radius;
	};
	this.set_position = function(x, y) {
		this.x_pos = x;
		this.y_pos = y;
	};
	this.area = function() {
		return Math.PI * this.radius * this.radius;
	}
	// Store passed
	if (xpos) this.x_pos = xpos;
	if (ypos) this.y_pos = ypos;
	if (radius) this.radius = radius;
	this.default_x = this.x_pos;
	this.default_y = this.y_pos;
	// Properties
	this.dead = false;
	// Player color
	this.fillStyle = "rgb(55,255,85)";
	// Methods
	this.reset = reset_cell;
	this.update = update_cell;
	this.draw = draw_cell;
}

function reset_cell() {
	this.x_pos = this.default_x;
	this.y_pos = this.default_y;
	this.x_veloc = 0;
	this.y_veloc = 0;
	this.dead = false;
}

function update_cell(frame_delta) {
	if (this.dead) return;
	// Enforce speed limits
	const xvelsign = this.x_veloc / Math.abs(this.x_veloc);
	if (Math.abs(this.x_veloc) > this.x_veloc_max) this.x_veloc = xvelsign * this.x_veloc_max;
	const yvelsign = this.y_veloc / Math.abs(this.y_veloc);
	if (Math.abs(this.y_veloc) > this.y_veloc_max) this.y_veloc = yvelsign * this.y_veloc_max;
	// Adjust the position, according to velocity.
	this.x_pos += this.x_veloc * frame_delta;
	this.y_pos += this.y_veloc * frame_delta;
	// Friction
	this.x_veloc *= this.friction;
	this.y_veloc *= this.friction;
}

function draw_cell(ctx, cam, shadow, player_radius) {
	if (this.dead) return;
	// Shadow
	if (shadow) {
		ctx.fillStyle = "rgba(0,0,0,0.3)"; // gray
		ctx.beginPath();
		ctx.arc(cam.world_to_viewport_x(this.x_pos) + 1, cam.world_to_viewport_y(this.y_pos) + 3, this.radius * cam.scale, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	}
	if (player_radius) {
		if (this.radius > player_radius) ctx.fillStyle = "rgb(255,68,26)"; // red
		else if (player_radius - this.radius <= 4) {
			let delta = player_radius - this.radius;
			if (delta <= 2) {
				var ref = [[255, 255], [68, 175], [26, 0]];
				ctx.fillStyle = "rgb(" + ref.map(x => x[0] + (x[1] - x[0]) * delta / 4).join(",") + ")";
			}
			else {
				delta -= 2;
				var ref = [[255, 54], [175, 182], [0, 255]];
				ctx.fillStyle = "rgb(" + ref.map(x => x[0] + (x[1] - x[0]) * delta / 4).join(",") + ")";
			}
		}
		else ctx.fillStyle = "rgb(54,182,255)"; // blue
	}
	else ctx.fillStyle = this.fillStyle;
	ctx.beginPath();
	ctx.arc(cam.world_to_viewport_x(this.x_pos), cam.world_to_viewport_y(this.y_pos), this.radius * cam.scale, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fill();
}

export default Cell;
