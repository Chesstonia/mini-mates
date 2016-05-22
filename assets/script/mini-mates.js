var done = false;

var app = angular.module("myApp", []).controller("SimpleController", function($scope, $interval){
   $scope.initialize = function(){
       $scope.getRandomPosition();
       $scope.ground = Chessground(document.getElementById('ground7'), {
	       viewOnly: false,
	       animation: {
		   duration: 500
	       },
	       movable: {
		   free: true,
		   premove: false,
		   events: {
		       after: $scope.onDrop
		   }
	       },
	       drawable: {
		   enabled: true
	       }
	   });
       window.cg6 = $scope.ground;       
       $scope.showPosition();
       
       done = false;
       $scope.positions = positionList;
       $scope.correctCount = 0;
       $scope.incorrectCount = 0;
       $scope.timerValue = 30;
   }
   
   $interval(function(){
	   if (done) return;
	   
	   $scope.timerValue -= 1;
	   if ($scope.timerValue == 0){
	       $scope.done();
	   }
       }, 1000);
   
   $scope.getRandomPosition = function(){
       if (done) return;
       var index = Math.floor(Math.random() * positionList.length);
       $scope.fen = positionList[index].fen;
       $scope.solution = positionList[index].solution;
   }
   
   $scope.onDrop = function(source, target, piece, newPosition, oldPosition, orientation){
       if (done) return;
       
       var move = $scope.board.move({from: source, to: target});
       if (move == null) return 'snapback';
       
       var solutionMoves = $scope.solution.split(" ");
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
       $scope.getRandomPosition();
       $scope.showPosition();
   }
   
   $scope.showPosition = function(){
       var fen = $scope.fen;
       $scope.board = new Chess(fen);        
       if (fen.includes(" b ")) {
	   $scope.color = "black";
       } else {
	   $scope.color = "white";
       }
       $scope.ground.set({
	       fen: fen,
	       orientation: $scope.color,
	       turnColor: $scope.color
	   });
   }
   
   $scope.done = function(){
       done = true;
       console.log("you finished " + $scope.correctCount + " in 30 seconds with " + $scope.incorrectCount + " mistakes");
       alert("you finished " + $scope.correctCount + " in 30 seconds with " + $scope.incorrectCount + " mistakes!");
   };
   
   $scope.initialize();
    });