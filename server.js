//https://github.com/socketio/socket.io/blob/master/examples/chat/index.js
const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const exec = require('child_process').exec;

var config = require("./config.json");

if (!(config.port >= 0 && config.port < 65536 && config.port % 1 === 0)) {
	console.error("[ERROR] `port` argument must be an integer >= 0 and < 65536. Default value will be used.");
	config.port = 8080;
}
var port = process.env.PORT || config.port;

server.listen(port, () => {
	console.log("Server listening at port %d", port);
});
//Routing
app.use(express.static(path.join(__dirname, "public")));
app.get("/port", (req, res) => {
	//Deploy to Heroku
	var ans = process.env.PORT ? 443 : port;
	res.end(ans.toString());
});
/*
var Game = require("./src/game-server");
var game = new Game();
io.set("transports", ["websocket"]);
io.on("connection", (socket) => {
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
