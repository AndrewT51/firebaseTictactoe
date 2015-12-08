var myFirebase = new Firebase('https://noughts-and-crosses.firebaseio.com/');
var player;
var numOfPlayers = 0;
var participant = false;
var turnNumber;
var player1Squares = [];
var	player2Squares = [];
var opponentMove;
var otherPlayer, symbol, otherSymbol;
var player1has3, player2has3;

function waitForCorrectNumOfPlayers(){
	myFirebase.once('value', function(snap){
		numOfPlayers = 0;
		if(snap.val() && snap.val().Player1){
			console.log('b')
			numOfPlayers ++
		} 
		if(snap.val() && snap.val().Player2){
			console.log('c')
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
			console.log('a')
			numOfPlayers ++
			displayJoinButton();
		}
	})

	myFirebase.on('child_removed', function(snap){
		$('td').removeClass('noughts crosses occupied');
		numOfPlayers --;
		player1Squares = [];
		player2Squares = [];
		myFirebase.off();
		myFirebase.remove();
		waitForCorrectNumOfPlayers();


	})
}

function displayJoinButton(){
	if(numOfPlayers<2 && !participant){
		$('#join').show().attr('disabled',false).css('display','block');
	}else if (numOfPlayers< 2 && participant){
		$('#join').hide();
		$('#message').show().append('<h2>Waiting for another player...</h2>');
	}else if (numOfPlayers === 2 && !participant){
		console.log('Please wait until current game is over')
		$('#join').attr('disabled', true);
	}else if (numOfPlayers === 2 && participant){
		$('#join').hide();
		$('#message').show().empty().append('<h2>You are '+ player + '.</h2>');
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

	myFirebase.child(otherPlayer).on('child_changed',function(dataSnapshot){
		opponentMove = '#' + dataSnapshot.val();
		if(player === 'Player1'){
			player2Squares = dataSnapshot.val().split('').concat(player2Squares);
			console.log('hey')
		}else{
			player1Squares = dataSnapshot.val().split('').concat(player1Squares);
			console.log('booo')
		}
		player1Squares.sort();
		player2Squares.sort();
		player1has3 = (/(.)\1{2}/).test(player1Squares.join(''));
		player2has3 = (/(.)\1{2}/).test(player2Squares.join(''));
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


	myFirebase.on('value',function(dataSnapshot){
		turnNumber = dataSnapshot.val().Turn || 0;
		console.log('update screen');
		$(opponentMove).addClass(symbol + ' occupied');

	});


	$('td').on('click',function(){
		$this = $(this);
		if (!$this.hasClass('occupied')){

			if ((player === 'Player1') && (turnNumber % 2 === 0)){		
				myFirebase.child(player).child('Move').set($this.attr('id'));
				$this.attr('class','noughts');
				player1Squares = $this.attr('id').split('').concat(player1Squares);
				console.log('boo')
				turnNumber ++;
				myFirebase.child('Turn').set(turnNumber);

			}else if ((player === 'Player2') && (turnNumber % 2 !== 0)){

				myFirebase.child(player).child('Move').set($this.attr('id'));
				$this.attr('class','crosses');
				player2Squares = $this.attr('id').split('').concat(player2Squares);
				console.log('heyy')
				turnNumber ++;
				myFirebase.child('Turn').set(turnNumber);
			}
		}
		player1Squares.sort();
		player2Squares.sort();
		player1has3 = (/(.)\1{2}/).test(player1Squares.join(''));
		player2has3 = (/(.)\1{2}/).test(player2Squares.join(''));
		console.log(turnNumber);
			// debugger;
			if (player1has3){
					myFirebase.child(otherPlayer).off();

				endGame('Player 1')
			}
			if (player2has3){
					myFirebase.child(otherPlayer).off();


				endGame('Player 2')
			}
			else if (turnNumber === 9){
					myFirebase.child(otherPlayer).off();


				endGame('Nobody');
				init();
			}
		})

function endGame(name){
	player=null;
	opponentMove=null;
	numOfPlayers=0;
	otherPlayer =null;
	symbol = null; 
	otherSymbol=null;
	participant=false;
	player1Squares = [];
	player2Squares = [];
	myFirebase.off('child_added');
	myFirebase.off('child_removed');
	myFirebase.off('child_changed');
	myFirebase.off('value');

	
	myFirebase.remove();
	var $winText = $('#winText');
	turnNumber = 0;
	$('#message').empty();
	$('#join').unbind('click');
	$('td').off();
	$this=null;
	setTimeout(function(){
		$('td').removeClass('noughts crosses occupied');
		$winText.hide();
		// debugger;
		waitForCorrectNumOfPlayers();
	}, 1500)
	$winText.text(name + ' was victorious!!');
	$winText.show();

}
}
