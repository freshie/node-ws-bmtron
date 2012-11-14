
	// on load of page
	$(document).ready(function() {

		$("#color-picker").on("change", function(){
			var selected = $('#color-picker option:selected').val();
			changePlayerColor(selected);
		});

		$("#start").on("click", function(event){
			event.preventDefault();
			startGame();
		});

	});


function startGame()
{
	$(window).keypress(function(e) {
			
			//d
			if(e.which == 100) {
				movePlayer("right");
			}
			//a
			if(e.which == 97) {
				movePlayer("left");
			}
			//w
			if(e.which == 119) {
				movePlayer("up");
			}
			//s
			if(e.which == 115) {
				movePlayer("down");
			}
		});
	$("#setUp").hide();
    $("#gameBoard").show();
}
populateColorPicker();

function changePlayerColor(color)
{
	if (color == "")
	{
	   color = "white"
	}

	$(".player-setup").attr("class", "player-Setup player-color-"+color)
	$(".player").attr("class", "player player-color-"+color)
	$(".player-part").css("background-color",color);
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
	$("body").append("<div id='orig-gameBoard' style='display: none;'>" + $("#gameBoard").html()+ "</div>");
};

function newGame()
{
	window.location = window.location;
};

function endGame()
{
	alert("You lost");
	newGame();
};

function movePlayer(direction)
{	
	var player = $(".player-part:first", "#gameBoard");
	var lastDirection = player.attr('data-direction');

	var x = player.offset().left;
	var y = player.offset().top;
	var offset =  player.offset();
	var notFirst = $(".player-part:not(:first)", "#gameBoard");

	var playerSize =  player.css("min-height");
	
	playerSize = parseInt(playerSize.replace("px",""));
	
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
	
	//sets the new offset
	player.offset({ left: x  , top: y });
	
	// checks to see if it will run into its self
	var gamebox = findIntersectors(player, $('#gameBoard'));

	// checks to see if it will run into its self
	var intersectors = findIntersectors(player, notFirst);

	//checks to make sure they cant back up into them selfs
	var didBackInToSelf = backInToSelf(lastDirection, direction);

	if (gamebox.length == 0 || intersectors.length != 0 || didBackInToSelf)
	{
		player.offset({ left: offset.x  , top: offset.y });
		endGame();
	} else {
			
		player.attr('data-last-left', offset.left);
		player.attr('data-last-top', offset.top);

		//for classes & looks
		player.attr('data-last-direction', lastDirection);
		player.attr('data-direction', direction);
		player.attr('class', "player-part direction-"+direction);
		
		//moves the rest of the parts to the last location of the prev part
		notFirst.each(function(index) {
			 movePart(this,index);
		});
		
		checkapples(player);
	}		
}

function movePart(part, index)
{
	 var prevPart = $(part).prevAll(".player-part")
	 var x = prevPart.attr('data-last-left');
	 var y = prevPart.attr('data-last-top');
	 var offset = $(part).offset();
	 var newDirection = prevPart.attr('data-last-direction');
	 var lastDirection = $(part).attr('data-direction')
	 var count = $(".player-part:not(:first)","#gameBoard").length - 1;

	 //sets the new offset
	 $(part).offset({ left: x  , top: y });
	 $(part).attr('data-last-left',  offset.left);
	 $(part).attr('data-last-top', offset.top);

	//for classes & looks
	 $(part).attr('data-last-direction', lastDirection);
	 $(part).attr('data-direction', newDirection);
	 
	 //makes it so the last part doesnt look funny with all other locations change 
	 if (count != index)
	 	$(part).attr('class', "player-part direction-"+newDirection);
	 else	
	 	$(part).attr('class', "player-part direction-"+prevPart.attr('data-direction'));
							
}
 
//checks to see if it "eat" the apple
function checkapples(player)
{
	var eat = findIntersectors(player, $(".apple"));

    if (eat.length != 0)
    { 
         var maxY = $("#gameBoard").height();
         var maxX = $("#gameBoard").width();

         do
  		 {
  			  y = getRandomArbitary(1, maxY);
			  x = getRandomArbitary(1, maxX);
  			 $(".apple").offset({ left: x  , top: y });
 		 }
  		 while (findIntersectors(player, $(".apple","#gameBoard")).length != 0);
        
    	 $(".player-part:last","#gameBoard").clone().appendTo('.player',"#gameBoard");
    	
    	var lastPart = $(".player-part:last","#gameBoard");

		var count = $(".player-part:not(:first)","#gameBoard").length - 1;
		
		movePart(lastPart, count);
	}
}

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

function backInToSelf(lastDirection, direction)
{
	return (lastDirection == "left" && direction == "right") 
		|| (lastDirection == "right" && direction == "left") 
		|| (lastDirection == "up" && direction == "down") 
		|| (lastDirection == "down" && direction == "up");
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
          var i_x = [thisPos.left, thisPos.left + $this.outerWidth()]
          var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

          if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
               t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
              intersectors.push($this);
          }

    });
    return intersectors;
}