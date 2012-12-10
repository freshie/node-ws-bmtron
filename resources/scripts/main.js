var socket = io.connect(serverIP + ':' + window.location.port);
var movementInterval = setInterval(function() {  }, 2500000);

var playersColor = "";
var players = {};
var map = {};
var that;
	// on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		showSettings();
	});

	socket.on('getAllPlayers', function (InPlayers) {
		$("#gameBoard").html();
		players = InPlayers;

		renderAllPlayers();
		
		updateMap();

		renderScoreBoard();
	});

	socket.on('mapUpdate', function (InMap) {
		if (playersColor !== "")
		{
			map = InMap;

			$('#gameBoard').width(map.width);
			$('#gameBoard').height(map.height);

			for (var part in map.parts)
			{
				$("#gameBoard").append('<span class="gamepart" style="top: '+ map.parts[part].y +'px; left: '+ map.parts[part].x +'px; width: '+ map.parts[part].width +'px; height: '+ map.parts[part].height +'px;" />');
			}

			$("#connecting").hide();
			$("#gameBoard").show();
			movementInterval = setInterval(function() { moveAllPlayers(); }, 250);
		}
		
	});

	socket.on('playerUpdate', function (InPlayer) {
		if (playersColor !== "")
		{
			players[InPlayer.color] = InPlayer;

			renderPlayer(InPlayer.color);
			renderScoreBoard();
		}
			
	});

	socket.on('playerRespawn', function (InPlayer) {
		if (playersColor !== "")
		{
			players[InPlayer.color] = InPlayer;

			renderPlayer(InPlayer.color);

			movementInterval = setInterval(function() { moveAllPlayers(); }, 250); 
			renderScoreBoard();
		}
			
	});

	
// on load of page
$(document).ready(function() {

	var opts = {
		lines: 13, // The number of lines to draw
		length: 7, // The length of each line
		width: 4, // The line thickness
		radius: 10, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '-10px', // Top position relative to parent in px
		left: '-50px' // Left position relative to parent in px
		};
		var target = document.getElementById('spinner');
		var spinner = new Spinner(opts).spin(target);

	$("#color-picker").on("change", function(){
		var selected = $('#color-picker option:selected').val();
		changePlayerColor(selected);
	});

	$("#start").on("click", function(event){
		event.preventDefault();
		startGame();
	});

});

populateColorPicker();

function updateMap()
{
	clearInterval(movementInterval);

	$("#spinner-text").html("loading map...");
	$("#gameBoard").hide();
	$("#scoreBoard").hide();
	$("#connecting").show();
	
	socket.emit('getMap'); 
}

function renderScoreBoard()
{
	function compare(a,b) {
		if (a.parts.length < b.parts.length)
		 return 1;
		if (a.parts.length > b.parts.length)
			return -1;

		return 0;
	}

	var ScoaredPlayers = $.map(players, function (value, key) { return value; });
	ScoaredPlayers.sort(compare);

	html = "<h1>Players:</h1> <ul>";

	for (var player in ScoaredPlayers)
	{
		if (ScoaredPlayers[player].color != 'apple')
		html = html + '<li class="">'+ ScoaredPlayers[player].color +': '+ ScoaredPlayers[player].parts.length +'</li>';
	}
		html = html + "</ul>";
	$('#scoreBoard').html(html);
	$('#scoreBoard').show();
}

function renderPlayer(player)
{

	if (player != 'apple')
	{
		var classADD = "";

		if (playersColor == players[player].color)
			classADD = "player-yours";

		$('.player-'+  players[player].color).remove();
		$("#gameBoard").append('<span class="player player-'+  players[player].color + ' '+ classADD+'" />');
	}
	for (var part in players[player].parts)
	{
		if (player == 'apple')
		{
			$('.apple-part-'+ part).remove();
			$("#gameBoard").append('<span class="apple apple-part-'+ part +'" style="top: '+ players[player].parts[part].y +'; left: '+ players[player].parts[part].x +';">');
		} else {
			var partDirection = players[player].parts[part].direction;

			if (part ==  (players[player].parts.length - 1))
				partDirection = players[player].parts[(part - 1 )].direction;

			
			$(".player-" + players[player].color).append('<span class="player-part direction-'+ partDirection +'" style="background-color: '+players[player].color +';  top: '+ players[player].parts[part].y +'px; left: '+ players[player].parts[part].x +'px;" />');
		}
		
	}
	if (player != 'apple')
	{
		$(".player-part:first", ".player-" + players[player].color).html('<span class="player-eyes"><span class="player-eye player-eye-left"></span><span class="player-eye player-eye-right"></span></span>');
		$(".player-part", ".player-" + players[player].color).css("background-color",players[player].color);
		$(".player-part", ".player-" + players[player].color).css("border-color",players[player].color);
		$(".player-eye", ".player-" + players[player].color).css("background-color",players[player].color);
	}
	//iterate through every element
	$('.player-eye', '.player-'+  players[player].color).each(function() {
		//set up color properties to iterate through
		var colorProperties = ['background-color'];
		invertColor(this, colorProperties);
	});

	//iterate through every element
	$('.player-part', '.player-'+  players[player].color).each(function() {

		//set up color properties to iterate through
		var colorProperties = ['border-color'];
		invertColor(this, colorProperties);
	});

}

function renderAllPlayers()
{
	for (var player in players)
		{
			renderPlayer(player);
		}
}

function showSettings()
{
	$("#settings").show();
	$("#gameBoard").hide();
	$("#connecting").hide();
	$("#scoreBoard").hide();
	
}

function startGame()
{
	if (playersColor === "")
	{
		alert("you have to pick a color");
	} else {
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		socket.emit('addPlayer', playersColor);

		$(window).keypress(function(e) {
				var player = players[playersColor];
				//d
				if(e.which == 100) {
					movePlayer("right", player);
				}
				//a
				if(e.which == 97) {
					movePlayer("left", player);
				}
				//w
				if(e.which == 119) {
					movePlayer("up", player);
				}
				//s
				if(e.which == 115) {
					movePlayer("down", player);
				}
			});
		$("#settings").hide();
		$("#spinner-text").html("loading players...");
		$("#connecting").show();
		
	}
}

function changePlayerColor(color)
{
	playersColor = color;
	if (color === "")
	{
		color = "white";
	}

	
	$(".player").attr("class", "player player-"+color);
	$(".player-part").css("background-color",color);
	$(".player-part").css("border-color",color);
	
	$(".player-eye").css("background-color",color);
	
	//iterate through every element
	$('.player-eye').each(function() {
		//set up color properties to iterate through
		var colorProperties = ['background-color'];
		invertColor(this, colorProperties);
	});

	//iterate through every element
	$('.player-part').each(function() {

		//set up color properties to iterate through
		var colorProperties = ['border-color'];
		invertColor(this, colorProperties);
	});
	
}

function invertColor(element, colorProperties){
	var color = null;

		for (var prop in colorProperties)
		{
			prop = colorProperties[prop];
			
			//if we can't find this property or it's null, continue
			if (!$(element).css(prop))
				continue;

			//create RGBColor object
			color = new RGBColor($(element).css(prop));
			
			if (color.ok)
			{
				//good to go, let's build up this RGB baby!
				//subtract each color component from 255
				$(element).css(prop, 'rgb(' + (255 - color.r) + ', ' + (255 - color.g) + ', ' + (255 - color.b) + ')');
			}

			color = null; //some cleanup
		}
}

function populateColorPicker()
{
	for (var i = 0; i < playerColors.length; i++)
   {
	html = '<option value="' + playerColors[i] +'">' + playerColors[i] + '</option>';
	$("#color-picker").append(html);
   }
   
}

function copyGameBoard()
{
	$("#cashe").append("<div id='orig-gameBoard' style='display: none;'>" + $("#gameBoard").html()+ "</div>");
}

function newGame()
{
	socket.emit('respawnPlayer', playersColor); 
	
}

function endGame()
{
	
		$( "#respawn" ).dialog({
			modal: true,
			closeOnEscape: false,
			buttons: 
				[{ 
					text: "Yes", 
					click: function() {  newGame(); $( this ).dialog( "close" );   }
 
				} ]
		});
  
	
}

function moveAllPlayers(){
	/* 
		moveAllPLayers and update player are cofliting and making movement weard.
		so for now just use updatep player and only move your self
	for (var player in players)
		{
			if (player != 'apple')
			{
				movePlayer(players[player].parts[0].direction, players[player]);
			}
		}
	*/
	movePlayer(players[playersColor].parts[0].direction, players[playersColor]);
}

function movePlayer(direction, player)
{
	
	var playerSelecter = $(".player-" + player.color);

	for (var part = (player.parts.length - 1); part >= 0; part--)
	{
		if(part === 0)
		{
			var partSelector = $(".player-part:eq("+part+")", playerSelecter);
			var playerSize = partSelector.css("min-height");
			playerSize = player.parts[part].height;
			
			var x = player.parts[part].x;
			var y = player.parts[part].y;

			playerSize = playerSize + 3;
			//deturms the new cords
			if (direction == "right")
				x = x + playerSize;
			else if (direction == "left")
				x = x - playerSize;
			else if (direction == "up")
				y = y - playerSize;
			else if (direction == "down")
				y = y + playerSize;

			
			newPlayer = player.parts[part];
			newPlayer.x = x;
			newPlayer.y = y;
			newPlayer.direction = direction;
			
			// checks to see if it will run into its self
			var gamebox = findIntersectors(newPlayer, map);

			
			// checks to see if it will run into others
			var intersectOthers = 0;

			for (var other in players)
			{
				if (other.color == player.color && other.color != 'apple')
				{
					intersectOthers = intersectOthers +  findIntersectors(newPlayer, players[other].parts).length;
					
					if (intersectOthers > 0)
						break;
				}
			}

			// checks to see if it will run into its self
			var intersectSelf = findIntersectors(newPlayer, player.parts );

			
			
			//checks map
			var didRunIntoMapPart = findIntersectors(newPlayer, map.parts);
			
			

			if (playersColor == player.color && (gamebox.length === 0 || intersectSelf.lengt > 2 || didRunIntoMapPart.length !== 0 || intersectOthers !== 0))
			{
				
				endGame();
				clearInterval(movementInterval);
				break;

			} else {

				player.parts[part] = newPlayer;
				

				partSelector.offset({ left: x  , top: y });
				partSelector.attr('class', "player-part direction-"+ direction);
			}
		}
		else
		{
			//needs to use this object to make it pass by value
			//code for this thanks to Jonathan Snook post at: http://www.snook.ca/archives/javascript/javascript_pass/
			var partValue = new partobject(part);

			objectchanger(partValue.movePart);
		  
		 	player.parts[part] = partValue;
		}

	}

	//for classes & looks
	partSelector = $(".player-part:eq("+(player.parts.length - 1)+")", playerSelecter);
	partSelector.attr('class', "player-part direction-"+player.parts[(player.parts.length - 2)].direction);

	checkapples(player);
	
	if (playersColor == player.color)
	{
		socket.emit('updatePlayer', player);
	}
}

//code for this thanks to Jonathan Snook post at: http://www.snook.ca/archives/javascript/javascript_pass/
//makes objects pass by value
function objectchanger(fnc)
{
	fnc(); // runs the function being passed in
}

function partobject(part)
{
	this.x =  players[playersColor].parts[part].x;
	this.y =  players[playersColor].parts[part].y;
	this.direction =  players[playersColor].parts[part].direction;
	this.part = part;
	that = this; // is need for the objectchanger function
}

partobject.prototype.movePart = function()
{

	var playerSelecter = $(".player-" + playersColor);
	var partSelector = $(".player-part:eq("+that.part +")", playerSelecter);
	var prevPart = (parseInt(that.part , "") - 1);
	
	
	var x = players[playersColor].parts[prevPart].x;
	var y = players[playersColor].parts[prevPart].y;
	var NewDirection = players[playersColor].parts[prevPart].direction;

	partSelector.offset({ left: x, top: y });

	
	partSelector.attr('class', "player-part direction-"+ players[playersColor].parts[prevPart].direction);

	that.x = x;
	that.y = y;
	that.direction = NewDirection;
}


//checks to see if it "eat" the apple
function checkapples(player)
{
	var eat = findIntersectors(player.parts[0], players.apple.parts);
	
	if (eat.length !== 0)
	{
		//makes the new part
		var playerSelecter = $(".player-" + player.color);
		$(".player-part:last", playerSelecter).clone().appendTo(playerSelecter,"#gameBoard");
		
		var partCount = player.parts.length;
		var lastPart = player.parts[(partCount - 1)];

		//move the new part

		playerSize = lastPart.height + 3;

		//deturms the new cords
		if (lastPart.direction == "right")
			lastPart.x = lastPart.x - playerSize;
		else if (lastPart.direction == "left")
			lastPart.x = lastPart.x + playerSize;
		else if (lastPart.direction == "up")
			lastPart.y  = lastPart.y + playerSize;
		else if (lastPart.direction == "down")
			lastPart.y  = lastPart.y - playerSize;

		player.parts.push(lastPart);

		//moves the apple
		var maxY = map.height - players.apple.parts[0].height;
		var maxX = map.width - players.apple.parts[0].width;

		var x;
		var y;

		var intersectPlayers;

		var newApply = {};
		do
		 {
			newApply = players.apple.parts[0];
			newApply.x = getRandomArbitary(players.apple.parts[0].width,maxX);
			newApply.y = getRandomArbitary(players.apple.parts[0].height,maxY);
							
			
			intersectPlayers = 0;
			
			for (var other in players)
			{
				intersectPlayers = intersectPlayers +  findIntersectors(newApply, players[other].parts).length;
				if (intersectPlayers > 0)
					break;
			}

			intersectMapParts = findIntersectors(newApply,map.parts);
		}
		while (intersectPlayers === 0 && intersectMapParts.length === 0);
		
		$(".apple","#gameBoard").offset({ left: newApply.x  , top: newApply.y });
		players.apple.parts[0] = newApply;

		renderScoreBoard();
		socket.emit('updatePlayer', players.apple);
	}
}

function getRandomArbitary (min, max) {
	return Math.random() * (max - min) + min;
}

function findIntersectors(target, intersectorsPossible) {
	var intersectors = []
		, t_x = [target.x, target.x + target.width]
		, t_y = [target.y, target.y + target.height]
		, i_x
		, i_y;
	if (intersectorsPossible.hasOwnProperty(length))
	{
		for (var intersector in intersectorsPossible)
		{
		  i_x = [intersectorsPossible[intersector].x, intersectorsPossible[intersector].x + intersectorsPossible[intersector].width];
		  i_y = [intersectorsPossible[intersector].y, intersectorsPossible[intersector].y + intersectorsPossible[intersector].height];

		  if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
			   t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
			  intersectors.push(intersectorsPossible[intersector]);
		  }
		}
	}
	else
	{
		i_x = [intersectorsPossible.x, intersectorsPossible.x + intersectorsPossible.width];
		i_y = [intersectorsPossible.y, intersectorsPossible.y + intersectorsPossible.height];

		  if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
			   t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
			  intersectors.push(intersectorsPossible);
		  }
	}
 
	return intersectors;
}