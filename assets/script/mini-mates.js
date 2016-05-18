var done = false;
var app = angular.module("myApp", []).controller("SimpleController", function($scope, $interval){
  $scope.positions = positionList;
  $scope.correctCount = 0;
  $scope.incorrectCount = 0;
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
      if (fen.includes(" b ")) {
	$scope.color = "Black";
      } else {
	$scope.color = "White";
      }
      $scope.chessBoard = ChessBoard('board1', {
	      position: fen,
	      pieceTheme: 'script/chessboard.js/img/chesspieces/wikipedia/{piece}.png',
	      draggable: true,
	      orientation: $scope.color.toLowerCase(),
	      dropOffBoard: 'snapback',
	      showNotation: true,
	      showErrors: 'alert',
	      sparePieces: true,
	      onDrop: function(source, target, piece, newPosition, oldPosition, orientation){
		  if (done) return;
		  
		  var move = $scope.board.move({from: source, to: target});
		  if (move == null) return 'snapback';

		  var solutionMoves = solution.split(" ");
		  for (var i = 0; i < solutionMoves.length; i++){
		      var solutionMove = solutionMoves[i];

		      var solved = false;
		      if ((move.san == (solutionMove + "#")) || (("" + move.from + move.to) == solutionMove)){
			  $scope.correctCount += 1;;
			  $scope.$apply();
			  solved = true;
			  break;
		      }
		      if (!solved)
			  $scope.incorrectCount += 1;
		  }
		  $scope.showRandomPosition();
	      }
	  });      
  }

  $scope.done = function(){
      done = true;
      console.log("you finished " + $scope.correctCount + " in 30 seconds with " + $scope.incorrectCount + " mistakes");
      alert("you finished " + $scope.correctCount + " in 30 seconds with " + $scope.incorrectCount + " mistakes!");
  };

  $scope.showRandomPosition();
});
