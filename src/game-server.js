var Cell = require("./cell");
var config = require("../config.json");

function World() {
	// Constants
	this.level_radius = config.consts.LEVEL_RADIUS; // Define level boundary
	// Variables and setup
	this.cells = []; // Array of cells
	// For timer
	this.lastTick = new Date().getTime();
	this.frame_spacing;
	this.frame_delta;
	this.won = false; // Indicates if the player has won (and is now just basking in his own glory)
	this.load_level = function() {
		this.cells = [];
		this.won = false;
		this.clear_msgs();
		// Define the player first
		this.cells.push(new Cell(0, 0, 30));
		// Generate a bunch of random cells
		var rad, ang, r, x, y, cell;
		for (var i = 0; i < config.consts.NUM_CELLS; i++) {
			if (i < 4) rad = 5 + (Math.random() * 5); // Small cells
			else if (i < 6) rad = 40 + (Math.random() * 15); // Big cells
			else rad = 7 + (Math.random() * 35); // Everything else
			ang = Math.random() * 2 * Math.PI;
			r = Math.random() * (this.level_radius - 20 - rad - rad);
			x = (30 + rad + r) * Math.sin(ang);
			y = (30 + rad + r) * Math.cos(ang);
			cell = new Cell(x, y, rad);
			cell.x_veloc = (Math.random() - 0.5) * 0.35;
			cell.y_veloc = (Math.random() - 0.5) * 0.35;
			this.cells.push(cell);
		}
	};
	this.get_player = function() {
		if (this.cells.length > 0) return this.cells[0];
	};
	this.push_player_from = function(x, y) {
		var player = this.get_player();
		if (player && !player.dead) {
			var dx = player.x_pos - x;
			var dy = player.y_pos - y;
			// Normalize dx/dy
			var mag = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			dx /= mag;
			dy /= mag;
			// Reduce force in proportion to area
			var area = player.area();
			var fx = dx * (5 / 9); // (400 / (area + 64));
			var fy = dy * (5 / 9); //(400 / (area + 64));
			// Push player
			player.x_veloc += fx;
			player.y_veloc += fy;
			// Lose some mass (shall we say, 1/25?)
			var expense = (area / 25) / (2 * Math.PI * player.radius);
			player.radius -= expense;
			// Shoot off the expended mass in opposite direction
			var newrad = Math.sqrt((area / 20) / Math.PI);
			var newx = player.x_pos - (dx * (player.radius + newrad + 1)); // The +1 is for cushioning!
			var newy = player.y_pos - (dy * (player.radius + newrad + 1));
			var newcell = new Cell(newx, newy, newrad);
			newcell.x_veloc = -fx * 9;
			newcell.y_veloc = -fy * 9;
			this.cells.push(newcell);
			// Blip!
			music.play_sound("blip");
		}
	};
	this.transfer_mass = function(cell1, cell2) {
		var player = this.get_player();
		// Determine bigger cell
		var bigger = cell1;
		var smaller = cell2;
		if (cell2.radius > cell1.radius) {
			bigger = cell2;
			smaller = cell1;
		}
		// Overlap amount will affect transfer amount
		var overlap = (cell1.radius + cell2.radius - cell1.distance_from(cell2)) / (2 * smaller.radius);
		if (overlap > 1) overlap = 1;
		overlap *= overlap;
		var mass_exchange = overlap * smaller.area() * this.frame_delta;
		smaller.radius -= mass_exchange / (2 * Math.PI * smaller.radius);
		bigger.radius += mass_exchange / (2 * Math.PI * bigger.radius);

		// Check if we just killed one of the cells
		if (smaller.radius <= 1) {
			smaller.dead = true;
			// If we just killed the player, callback.
			if (smaller === player) this.player_did_die();
		}
	};
	this.player_did_die = function() {
		music.play_sound("death");
		this.show_message("death");
		// Cute animation thing
		var player = this.get_player();
		player.x_pos = player.y_pos = 0;
		for (var i = 1; i < this.cells.length; i++) {
			var cell = this.cells[i];
			if (!cell.dead) {
				cell.x_veloc += (cell.x_pos - player.x_pos) / 50;
				cell.y_veloc += (cell.y_pos - player.y_pos) / 50;
			}
		}
	};
	this.player_did_win = function() {
		if (!this.won) {
			this.won = true;
			music.play_sound("win");
			this.show_message("success");
		}
	};
	this.update = function() {
		var player = this.get_player();
		// Advance timer
		var currentTick = new Date().getTime();
		this.frame_spacing = currentTick - this.lastTick;
		this.frame_delta = this.frame_spacing * config.fps / 1000;
		this.lastTick = currentTick;
		// Run collisions and draw everything
		var smallest_big_mass = 9999999999,
			total_usable_mass = 0,
			curr_area;
		for (var i = 0; i < this.cells.length; i++) {
			if (this.cells[i].dead) continue;

			for (var j = 0; j < this.cells.length; j++) {
				if ((i != j) && (!this.cells[j].dead)) {
					if (this.cells[i].collides_with(this.cells[j])) {
						this.transfer_mass(this.cells[i], this.cells[j]);
					}
				}
			}
			this.cells[i].update(this.frame_delta);
			// Get some stats about orb sizes
			curr_area = this.cells[i].area();
			if (this.cells[i].radius > player.radius) {
				if (curr_area < smallest_big_mass) smallest_big_mass = curr_area;
			}
			else total_usable_mass += curr_area;
			// If cell is outside of level bounds, fix it
			var cell_x = this.cells[i].x_pos,
				cell_y = this.cells[i].y_pos,
				cellrad = this.cells[i].radius,
				dist_from_origin = Math.sqrt(Math.pow(cell_x, 2) + Math.pow(cell_y, 2));
			if (dist_from_origin + cellrad > this.level_radius) {
				// Do some homework
				var cell_xvel = this.cells[i].x_veloc,
					cell_yvel = this.cells[i].y_veloc;
				// Move cell safely inside bounds
				this.cells[i].x_pos *= ((this.level_radius - cellrad - 1) / dist_from_origin);
				this.cells[i].y_pos *= ((this.level_radius - cellrad - 1) / dist_from_origin);
				cell_x = this.cells[i].x_pos;
				cell_y = this.cells[i].y_pos;
				dist_from_origin = Math.sqrt(Math.pow(cell_x, 2) + Math.pow(cell_y, 2));
				// Bounce!
				// Find speed
				var cell_speed = Math.sqrt(Math.pow(cell_xvel, 2) + Math.pow(cell_yvel, 2));
				// Find angles of "center to cell" and cell's velocity
				var angle_from_origin = angleForVector(cell_x, cell_y);
				var veloc_ang = angleForVector(cell_xvel, cell_yvel);
				// Get new velocity angle
				var new_veloc_ang = Math.PI + angle_from_origin + (angle_from_origin - veloc_ang);
				// Normalize the vector from the origin to the cell's new position
				var center_to_cell_norm_x = -cell_x * (1 / dist_from_origin);
				var center_to_cell_norm_y = -cell_y * (1 / dist_from_origin);
				// Set new velocity components
				this.cells[i].x_veloc = cell_speed * Math.cos(new_veloc_ang);
				this.cells[i].y_veloc = cell_speed * Math.sin(new_veloc_ang);
				// If this cell is the player, make a bounce noise
				if (i == 0) music.play_sound("bounce");
			}
		}
		// React to statistical events
		if (!player.dead && !this.won) {
			if (smallest_big_mass == 9999999999) {
				// Player won
				this.player_did_win();
			}
			else if (total_usable_mass < smallest_big_mass) {
				// Display the "not looking good..." message
				this.show_message("warning");
			}
		}
	};
}

function angleForVector(x, y) {
	var ang = Math.atan(y / x);
	if (x < 0) ang += Math.PI;
	else if (y < 0) ang += 2 * Math.PI;
	return ang;
}

module.exports = World;
