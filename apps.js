var app = require('express').createServer();
var io = require('socket.io').listen(app);
var http = require('http');
var os = require('os');


//gets Ip address
var interfaces = os.networkInterfaces();
var addresses = [];
for (k in interfaces) {
    for (k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal && k != "VirtualBox Host-Only Network") {
        	addresses.push(address.address);
        }
    }
}


app.listen(8083);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});




app.get('/server/getIP', function(req, res){
	res.send("var serverIP = '" +addresses[0] +"';");
});

app.get('/resources/:sub/:file', function(req, res){
	var sub = req.params.sub
	, file = req.params.file;
 
  res.sendfile(__dirname + '/resources/' + sub + '/' + file);
   
});

app.get('/resources/:sub/:sub2/:file', function(req, res){
  var sub = req.params.sub
  	, sub2 = req.params.sub2
    , file = req.params.file;
 
  res.sendfile(__dirname + '/resources/' + sub + '/' + sub2 + '/' + file);
   
});

// game data
var players = {};
var map = {
			maxX: 1040,
			maxY: 758
		   };
var apple = {
			color: "apple",
			parts: [{
					x: getRandomArbitary(20,780),
					y: getRandomArbitary(20,580)
				}]
		};

players["apple"] = apple;

io.sockets.on('connection', function (socket) {

	
	socket.on('addPlayer', function(color){
		
		player = spawnRandomly(color);

		socket.color = color;
		
		players[player.color] = player;
		
		socket.emit('getAllPlayers', players);
		
		socket.volatile.broadcast.emit('playerUpdate', player);
	});

	socket.on('updatePlayer', function(player){
		
		players[player.color] = player;
		
		socket.volatile.broadcast.emit('playerUpdate', player);
	});

	socket.on('respawnPlayer', function(color){
		
		player = spawnRandomly(color);

		socket.color = color;
		
		players[player.color] = player;
		
		socket.volatile.broadcast.emit('playerUpdate', player);
		socket.volatile.emit('playerUpdate', player);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		if (socket.hasOwnProperty("color"))
		{
			delete players[socket.color];
			socket.broadcast.emit('playerRemove', socket.color);
		}
		
		
	});
});

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

function spawnRandomly(color)
{
	var x = getRandomArbitary(100,map.maxX);
	var y = getRandomArbitary(100,map.maxY);
	var directions = ['left','right','up','down'];
	var direction = directions[0];
	player = {
		color: color,
		parts: [
			{
				x: x,
				y: y,
				direction: direction,
				lastDirection: 'left',
				lastX: (x - 18),
				lastY: y
			},
			{
				x: (x + 18),
				y: y,
				direction: direction,
				lastDirection: 'left',
				lastX: (x + 36),
				lastY: y
			},
			{
				x: (x + 36),
				y: y,
				direction: direction,
				lastDirection: 'left',
				lastX: (x + 54),
				lastY: y
			}
		]
	};

	return player;
}