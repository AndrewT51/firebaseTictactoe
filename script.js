var myFirebase = new Firebase('https://noughts-and-crosses.firebaseio.com/');
var player;
var numOfPlayers = 0;
var participant = false;
var turnNumber;

function waitForCorrectNumOfPlayers(){
	myFirebase.once('value', function(snap){
		if(snap.val() && !snap.val().Player1){
			numOfPlayers ++
		} 
		if(snap.val() && !snap.val().Player2){
			numOfPlayers ++
		}
		displayJoinButton();
	})

	$('#join').on('click', function(){
		participant=true;
		myFirebase.once('value',function(snap){
			player = snap.val() && snap.val().Player1 ? 'Player2' : 'Player1';
			console.log(player)
			myFirebase.child(player).child('Move').set('');
			$(window).unload(function(){
				myFirebase.child(player).remove();
			})
		}) 
	})

	myFirebase.on('child_added', function(snap){
		if(snap.key() === 'Player1' || snap.key() === 'Player2'){
			numOfPlayers ++
			displayJoinButton();
		}
	})

	myFirebase.on('child_removed', function(snap){
		turnNumber = 0;
		// myFirebase.child('Turn').remove();
		myFirebase.remove()
		numOfPlayers --
		displayJoinButton();
	})
}

function displayJoinButton(){
	if(numOfPlayers<2 && !participant){
		$('#join').show().attr('disabled',false);
	}else if (numOfPlayers< 2 && participant){
		$('#join').hide();
		$('#wait').show();
	}else if (numOfPlayers === 2 && !participant){
		console.log('Please wait until current game is over')
		$('#join').attr('disabled', true);
	}else{
		$('#join').hide();
		$('#wait').hide();
		init();
	}

}

$(document).ready(waitForCorrectNumOfPlayers);


function init(){

	$('body').show()
	turnNumber = 0;
	player1Squares = [];
	player2Squares = [];

	myFirebase.child("Turn").set(0);
	console.log(turnNumber);
	var otherPlayer, symbol, otherSymbol;
	if (player === 'Player1'){
		otherPlayer = 'Player2';
		symbol = 'crosses';
		otherSymbol = 'noughts';
	}else{
		otherPlayer = 'Player1';
		symbol = 'noughts';
		otherSymbol = 'crosses';
	}

	 myFirebase.child(player).child('Move').set('');
  $(window).unload(function(){
    myFirebase.child(player).remove();
  })
 myFirebase.child(otherPlayer).on('child_changed',function(dataSnapshot){
   opponentMove = '#' + dataSnapshot.val();
   console.log('Opponent move=====' + opponentMove);
 })

 myFirebase.child("Gamestatus").on('child_changed',function(dataSnapshot){
   if (dataSnapshot.val() === 'over'){ endGame('loser')};

 })

 myFirebase.on('value',function(dataSnapshot){
   turnNumber = dataSnapshot.val().Turn || 0;
   console.log('update screen');
   $(opponentMove).addClass(symbol + ' occupied');
 });


	var opponentMove;
	$('td').click(function(){
		$this = $(this);
		if (!$this.hasClass('occupied')){
		
				if ((player === 'Player1') && (turnNumber % 2 === 0)){		
					myFirebase.child(player).child('Move').set($this.attr('id'));
					$this.attr('class','noughts');
					player1Squares = $this.attr('id').split('').concat(player1Squares);
					turnNumber ++;
					myFirebase.child('Turn').set(turnNumber);

				}else if ((player === 'Player2') && (turnNumber % 2 !== 0)){

					myFirebase.child(player).child('Move').set($this.attr('id'));
					$this.attr('class','crosses');
					player2Squares = $this.attr('id').split('').concat(player2Squares);
					turnNumber ++;
					myFirebase.child('Turn').set(turnNumber);
				}
			}
			player1Squares.sort();
			player2Squares.sort();
			var player1has3 = (/(.)\1{2}/).test(player1Squares.join(''));
			var player2has3 = (/(.)\1{2}/).test(player2Squares.join(''));
			console.log(turnNumber);
			if (player1has3){
				endGame('Player 1')
			}
			if (player2has3){
				endGame('Player 2')
			}
			else if (turnNumber === 9){
				endGame('Nobody');
				init();
			}
		})

function endGame(name){
	var $winText = $('#winText');
	turnNumber = 0;
	setTimeout(function(){
			// $('body').hide();
			$('td').removeClass('noughts crosses occupied');
			$winText.hide();
			init();
		}, 1500)
	$winText.text(name + ' was victorious!!');
	$winText.show();

}
}
