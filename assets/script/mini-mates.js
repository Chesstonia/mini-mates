var done = false;
var app = angular.module("myApp", []).controller("SimpleController", function($scope, $interval){
  $scope.positions = positionList;
  $scope.count = 0;
  $scope.timerValue = 30;
  $interval(function(){
    if (done) return;

    $scope.timerValue -= 1;
    if ($scope.timerValue == 0){
        $scope.done();
    }
  }, 1000);

  $scope.showRandomPosition = function(){
      if (done) return;
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
		      $scope.count += 1;;
		      $scope.$apply();
		  }
		  $scope.showRandomPosition();
	      }
	  });      
  }

  $scope.done = function(){
      done = true;
      $("#board1").hide();
      console.log("you finished " + $scope.count + " in 30 seconds");
      alert("you finished " + $scope.count + " in 30 seconds!");
  };

  $scope.showRandomPosition();
});
