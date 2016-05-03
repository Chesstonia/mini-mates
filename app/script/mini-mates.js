var done = false;
var app = angular.module("myApp", []).controller("SimpleController", function($scope){
  $scope.positions = positionList;
  $scope.count = 0;
  $scope.showRandomPosition = function(){
      var index = Math.floor(Math.random() * positionList.length);
      $scope.fen = positionList[index].fen;
      var solution = positionList[index].solution;
      $scope.showPosition($scope.fen, solution);
  }

  $scope.showPosition = function(fen, solution){
      $scope.board = new Chess(fen);        
      $scope.chessBoard = ChessBoard('board1', {
	      position: fen,
	      pieceTheme: 'script/chessboard.js/img/chesspieces/wikipedia/{piece}.png',
	      draggable: true,
	      dropOffBoard: 'snapback',
	      showNotation: true,
	      showErrors: 'alert',
	      onDrop: function(source, target, piece, newPosition, oldPosition, orientation){
		  if (done) return;
		  
		  var move = $scope.board.move({from: source, to: target});
		  if (move == null) return 'snapback';
		  if (move.san == (solution + "#")){
		      $scope.count++;
		  }
		  $scope.showRandomPosition();
	      }
	  });      
  }

  $scope.done = function(){
      alert("you finished " + $scope.count + " in 30 seconds!");
  };

  $scope.showRandomPosition();

  function timer(x){
      if (x == 30) {
	  done = true;
	  $scope.done();
      } else {
	  setTimeout(function(){
		  timer(x + 1);
	      }, 1000);
      }
  }

  timer(0);
});
