// https://github.com/socketio/socket.io/blob/master/examples/chat/index.js
import MiServer from "mimi-server";

import express from "express";
import path from "path";
import { exec } from "child_process";
import config from "./config.js";
config.dev ? exec("npm run build-dev") : exec("npm run build");

const port = process.env.PORT || config.port;
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { app, server } = new MiServer({
	port,
	static: path.join(__dirname, "public")
});

import { Server } from "socket.io";
const io = new Server(server);

// Routing
app.use("/font", express.static(path.join(__dirname, "node_modules/@fortawesome/fontawesome-free")));

import Game from "./src/game-server.js";
const game = new Game();

io.on("connection", socket => {
	socket.on("hello", (data, fn) => {
		//TODO: error checking.
		if (data.god && game.addGod(socket)) {
			fn(true);
			return;
		}
		if (data.name && data.name.length > 32) fn(false, "Your name is too long!");
		else if (!game.addPlayer(socket, data.name)) fn(false, "There're too many platers!");
		else fn(true);
	});
	socket.on("pings", (fn) => {
		socket.emit("pongs");
		socket.disconnect();
	});
});
/*
setInterval(() => {
	game.tickFrame();
}, 1000 / 60);
/*
for (var i = 0; i < parseInt(config.bots); i++) {
	exec(`node ${path.join(__dirname, "paper-io-bot.js")} ws://localhost:${port}`, (error, stdout, stderr) => {
		if (error) {
			console.error("error: " + error);
			return;
		}
		console.log("stdout: " + stdout);
		console.log("stderr: " + typeof stderr);
	});
}
*/
