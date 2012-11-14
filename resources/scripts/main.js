var socket = io.connect(window.location.host);
var movementInterval = setInterval(function() {  }, 2500000);

var playersColor = "";
var players = {};
	// on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		showSettings();
	});

	socket.on('getAllPlayers', function (InPlayers) {
		$("#gameBoard").html();
		players = InPlayers;

		renderAllPlayers();

		$("#connecting").hide();
		$("#gameBoard").show();
		clearInterval(movementInterval);
		movementInterval = setInterval(function() { moveAllPlayers(); }, 250);
		
	});

	socket.on('playerUpdate', function (InPlayer) {
		if (playersColor !== "")
		{
			players[InPlayer.color] = InPlayer;

			renderPlayer(InPlayer.color);
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
	//$("#gameBoard").html($("#cashe").html());
}

function endGame()
{
	alert("You lost");
	newGame();
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

	for (var part in player.parts)
	{

		if(part == '0')
		{
			var partSelector = $(".player-part:eq("+part+")", playerSelecter);
			var playerSize = partSelector.css("min-height");
			playerSize = playerSize.replace("px","");
			playerSize = parseInt(playerSize, '');
			
			var x = player.parts[part].x;
			var y = player.parts[part].y;

			playerSize = playerSize + 2;
			//deturms the new cords
			if (direction == "right")
				x = x + playerSize;
			else if (direction == "left")
				x = x - playerSize;
			else if (direction == "up")
				y = y - playerSize;
			else if (direction == "down")
				y = y + playerSize;

			partSelector.offset({ left: x  , top: y });
			partSelector.attr('class', "player-part direction-"+ direction);
			var notFirst = $(".player-part:not(:first)", playerSelecter);
 
			// checks to see if it will run into its self
			var gamebox = findIntersectors(partSelector, $('#gameBoard'));

			// checks to see if it will run into its self
			var intersectors = findIntersectors(partSelector, notFirst);

			//checks to make sure they cant back up into them selfs
			var didBackInToSelf = backInToSelf(player.parts[part].direction, direction);
			
			

			if (playersColor == player.color && (gamebox.length === 0 || intersectors.length !== 0 || didBackInToSelf))
			{
				partSelector.offset({ left: player.parts[part].LastX, top: player.parts[part].LastY });
				endGame();
				clearInterval(movementInterval);
				break;
			}

			player.parts[part] = {
			x: x,
			y: y,
			direction: direction,
			lastDirection: player.parts[part].direction,
			lastX: player.parts[part].x,
			lastY: player.parts[part].y
			};
		}
		else
		{
			movePart(part, player);
		}

	}

	checkapples(player);
	
	if (playersColor == player.color)
	{
		socket.emit('updatePlayer', player);
	}
}

function movePart(part, player)
{
	var playerSelecter = $(".player-" + player.color);
	var partSelector = $(".player-part:eq("+part+")", playerSelecter);
	var prevPart = (parseInt(part, "") - 1);
	
	var x = player.parts[prevPart].lastX;
	var y = player.parts[prevPart].lastY;
	var direction = player.parts[prevPart].lastDirection;

	partSelector.offset({ left: x, top: y });

	
	//for classes & looks
	if (player.parts.length == (parseInt(part,"") + 1))
		partSelector.attr('class', "player-part direction-"+player.parts[prevPart].direction);
	else
		partSelector.attr('class', "player-part direction-"+ player.parts[prevPart].lastDirection);

	player.parts[part] = {
		x: x,
		y: y,
		direction: direction,
		lastDirection: player.parts[part].direction,
		lastX: player.parts[part].x,
		lastY: player.parts[part].y
	};
}
 
//checks to see if it "eat" the apple
function checkapples(player)
{
	var playerSelecter = $(".player-" + player.color);
	var partFirstSelector = $(".player-part:first", playerSelecter);
	var eat = findIntersectors(partFirstSelector, $(".apple","#gameBoard"));

    if (eat.length !== 0)
    {
        $(".player-part:last", playerSelecter).clone().appendTo(playerSelecter,"#gameBoard");
		
		var partCount = player.parts.length;
		var lastPart = player.parts[(partCount - 1)];

		player.parts.push(lastPart);

		movePart(partCount, player);

		var appleSize = $(".apple","#gameBoard").css("min-height");

		appleSize = appleSize.replace("px","");
		appleSize = parseInt(appleSize, '');

		var maxY = $("#gameBoard").height() - appleSize;
        var maxX = $("#gameBoard").width() - appleSize;

        var playersParts = $(".player-part","#gameBoard");
        var x;
        var y;

        do
         {
			y = getRandomArbitary(appleSize, maxY);
			x = getRandomArbitary(appleSize, maxX);
			$(".apple","#gameBoard").offset({ left: x  , top: y });
		}
		while (findIntersectors(playersParts, $(".apple","#gameBoard")).length !== 0);
		
		players.apple.parts[0].x = x;
		players.apple.parts[0].y = y;

		socket.emit('updatePlayer', players.apple);
	}
}

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

function backInToSelf(lastDirection, direction)
{
	return (lastDirection == "left" && direction == "right") || (lastDirection == "right" && direction == "left") || (lastDirection == "up" && direction == "down") || (lastDirection == "down" && direction == "up");
}

//This function will detect if any of the specified elements is overlapping a target element:
function findIntersectors(targetSelector, intersectorsSelector) {
    var intersectors = [];

    var $target = $(targetSelector);
    var tAxis = $target.offset();
    var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
    var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];

    $(intersectorsSelector).each(function() {
          var $this = $(this);
          var thisPos = $this.offset();
          var i_x = [thisPos.left, thisPos.left + $this.outerWidth()];
          var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

          if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
               t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
              intersectors.push($this);
          }

    });
    return intersectors;
}