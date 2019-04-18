var Mover = require("./Mover");

function Cell(xpos, ypos, radius) {
	// Inherit from Mover
	this.inheritFrom = Mover;
	this.inheritFrom();
	// Store passed
	if (xpos) this.x_pos = xpos;
	if (ypos) this.y_pos = ypos;
	if (radius) this.radius = radius;
	this.default_x = this.x_pos;
	this.default_y = this.y_pos;
	// Properties
	this.dead = false;
	// Player color
	//this.fillStyle = "rgb(115,219,255)";
	this.fillStyle = "rgb(55,255,85)";
	// Methods
	this.reset = reset_cell;
	this.update = update_cell;
	this.draw = draw_cell;
	this.push_up = function(mag) {
		if (!mag) mag = 1;
		this.y_veloc -= mag;
	};
	this.push_down = function(mag) {
		if (!mag) mag = 1;
		this.y_veloc += mag;
	};
	this.push_left = function(mag) {
		if (!mag) mag = 1;
		this.x_veloc -= mag;
	};
	this.push_right = function(mag) {
		if (!mag) mag = 1;
		this.x_veloc += mag;
	};
	this.area = function() {
		return Math.PI * this.radius * this.radius;
	}
}

function reset_cell() {
	this.x_pos = this.default_x;
	this.y_pos = this.default_y;
	this.x_veloc = 0;
	this.y_veloc = 0;
	this.dead = false;
}

function update_cell(frame_delta) {
	if (!this.dead) this.update_mover(frame_delta);
}

function draw_cell(ctx, cam, shadow, player_radius) {
	if (!this.dead) {
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
				var delta = player_radius - this.radius;
				if (delta <= 2) {
					var ref = [[255, 255], [68, 175], [26, 0]];
					ctx.fillStyle = "rgb(" + ref.map(x => x[0] + (x[1] - x[0]) * delta / 4).join(",") + ")";
				}
				else {
					delta -= 2;
					var ref = [[255, 54], [175, 182], [0, 255]];
					ctx.fillStyle = "rgb(" + ref.map(x => x[0] + (x[1] - x[0]) * delta / 4).join(",") + ")";
				}
				//ctx.fillStyle = "#FFAF00"; // yellow
			}
			else ctx.fillStyle = "rgb(54,182,255)"; // blue
		}
		else ctx.fillStyle = this.fillStyle;
		ctx.beginPath();
		ctx.arc(cam.world_to_viewport_x(this.x_pos), cam.world_to_viewport_y(this.y_pos), this.radius * cam.scale, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	}
}

module.exports = Cell;
