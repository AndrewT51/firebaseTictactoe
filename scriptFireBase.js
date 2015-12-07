$(document).ready(assignPlayers);

function assignPlayers(){
 var myFirebase = new Firebase('https://noughts-and-crosses.firebaseio.com/');

 // myFirebase.remove();
  $('button').click(function(){
   myFirebase.once('value',function(dataSnapshot){
    // myFirebase.child("Gamestatus").set('inplay');
    player = dataSnapshot.val() === null ? 'Player1' : 'Player2';
    $('button').hide();
    init(myFirebase,player);
  })
 })
}

function init(myFirebase,player){
  console.log(player);
  $('body').show();
  var turnNumber = 0;
  myFirebase.child("Turn").set(0);
  console.log(turnNumber);
  var opponentMove;
  player1Squares = [];
  player2Squares = [];
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

 $('td').click(function(){
   $this = $(this);
   console.log('Hello');
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
 var player1has3 = (/(.)\1{2}/i).test(player1Squares.join(''));
 var player2has3 = (/(.)\1{2}/i).test(player2Squares.join(''));
 if (player1has3 ){
  endGame('Player 1',myFirebase)
  myFirebase.remove();
  init();
}
if (player2has3){
  endGame('Player 2', myFirebase)
  myFirebase.remove();
  init();
}
else if (turnNumber === 9){
  endGame('Nobody', myFirebase);
  myFirebase.remove();
  init();

}

})

function endGame(name,myFirebase){
 myFirebase.child('Gamestatus').set('over');
 var $winText = $('#winText');
 turnNumber = 0;
 setTimeout(function(){
  $('body').hide();
  $('td').removeClass('noughts crosses occupied');
  $winText.hide();
  assignPlayers();
}, 1500)
 $winText.text(name + ' was victorious!!');
 $winText.show();


}
}
