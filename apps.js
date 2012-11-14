var app = require('express').createServer();
var io = require('socket.io').listen(app);
var http = require('http');
app.listen(8083);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
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

// chat data
var players = {};

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
		
		var x = getRandomArbitary(40,760);
		var y = getRandomArbitary(40,560);

		player = {
			color: color,
			parts: [
				{
					x: x,
					y: y,
					direction: 'left',
					lastDirection: 'left',
					lastX: (x - 18),
					lastY: y
				},
				{
					x: (x + 18),
					y: y,
					direction: 'left',
					lastDirection: 'left',
					lastX: (x + 36),
					lastY: y
				},
				{
					x: (x + 36),
					y: y,
					direction: 'left',
					lastDirection: 'left',
					lastX: (x + 54),
					lastY: y
				}
			]
		};

		socket.player = player;
		
		players[player.color] = player;
		
		socket.emit('getAllPlayers', players);
		
		socket.broadcast.emit('playerUpdate', player);
	});

	socket.on('updatePlayer', function(player){
		
		
		
		players[player.color] = player;
		
		socket.broadcast.emit('playerUpdate', player);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		if (socket.hasOwnProperty("player"))
		{
			delete players[socket.player.color];
			socket.broadcast.emit('playerRemove', socket.player.color);
		}
		
		
	});
});

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}