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
			color: "red",
			parts: [{
					x: '849.2294231709093',
					y: '574.4140890575945'
				}]
		};

players["apple"] = apple;

io.sockets.on('connection', function (socket) {

	
	socket.on('addPlayer', function(color){
		
		player = {
			color: color,
			parts: [
				{
					x: 400,
					y: 216,
					direction: 'left',
					lastDirection: 'left',
					lastX: 418,
					lastY: 216
				},
				{
					x: 418,
					y: 216,
					direction: 'left',
					lastDirection: 'left',
					lastX: 436,
					lastY: 223
				},
				{
					x: 436,
					y: 216,
					direction: 'left',
					lastDirection: 'left',
					lastX: 454,
					lastY: 223
				}
			]
		};

		socket.player = player;
		
		players[player.color] = player;
		
		socket.emit('getAllPlayers', players);
		
		socket.broadcast.emit('playerAdded', player);
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