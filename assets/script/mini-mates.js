var done = false;
var initialized = false;
var timerStartValue = 30;
var initialBonus = 30;

var app = angular.module("myApp", []).controller("SimpleController", function($scope, $interval){
   $scope.initialize = function(){
       if (!initialized){ // only true the first time
	   initialized = true;
	   $scope.ground = Chessground(document.getElementById('ground7'), {
		   viewOnly: false,
		   animation: {
		       enabled: false
		   },
		   highlight: {
		       lastMove: false,
		       check: false		       
		   },
		   movable: {
		       free: false,
		       dropoff: "revert",
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
       }
       done = false;
       $scope.getRandomPosition();
       $scope.showPosition();
       
       $scope.problemSet = "matein1";
       $scope.positions = mates;
       $scope.correctCount = 0;
       $scope.incorrectCount = 0;
       $scope.timeLasted = 0;
       $scope.timerValue = timerStartValue;
       $scope.bonus = initialBonus;
       $scope.puzzlesNeeded = 1;
       $scope.bonusRequirement = 1;
   }
   
   $interval(function(){
	   console.log($scope.problemSet);
	   if (done) return;
	   
	   if ($scope.timerValue <= 0){
	       $scope.done();
	   } else {
	       $scope.timerValue -= 1;
	       $scope.timeLasted++;
	   }
       }, 1000);
   
   $scope.getRandomPosition = function(){
       if (done) return;
       if ($scope.problemSet == "hanging"){
	   $scope.positions = hangers;
       } else {
	   $scope.positions = mates;
       }
       var index = Math.floor(Math.random() * $scope.positions.length);
       
       $scope.fen = $scope.positions[index].fen;
       $scope.solution = $scope.positions[index].solution;
       $scope.chess = new Chess($scope.fen);
   }
   
   $scope.onDrop = function(source, target, piece, newPosition, oldPosition, orientation){
       if (done) return;
       
       var solutionMoves = $scope.solution.split(" ");
       for (var i = 0; i < solutionMoves.length; i++){
	   var solutionMove = solutionMoves[i];
	   var solved = false;
	   var correct = false;
	   if ($scope.problemSet == "matein1"){
	       if ((source + target) == solutionMove.substring(0,4))
		   correct = true;
	   } else {
	       if (solutionMove.split(" ").indexOf(target) != -1)
		   correct = true;
	   }
	   if (correct) {
	       console.log("correct!");
	       $scope.correctCount += 1;
	       $scope.puzzlesNeeded--;
	       if ($scope.puzzlesNeeded == 0){
		   $scope.timerValue += $scope.bonus;
		   $scope.puzzlesNeeded = $scope.bonusRequirement;
		   $scope.bonusRequirement++;
	       }
	       $scope.$apply();
	       solved = true;
	       break;
	   }
       }
       if (!solved){
	   console.log("incorrect");
	   $scope.incorrectCount += 1;
       }
       $scope.getRandomPosition();
       $scope.showPosition();
   }
   
   $scope.showPosition = function(){
       var fen = $scope.fen;
       if (fen.includes(" b ")) {
	   $scope.color = "black";
	   $("body").css("background-color", "000");
       } else {
	   $scope.color = "white";
	   $("body").css("background-color","FFF");
       }
       $scope.ground.set({
	       fen: fen,
	       orientation: $scope.color,
	       turnColor: $scope.color,
	       movable: { 
		   dests: $scope.chessToDests($scope.chess),
		   showDests: false
	       }
	   });
   }
   
   $scope.done = function(){
       done = true;
       var report = "you got " + $scope.correctCount + " correct, with " + $scope.incorrectCount + " mistakes, and stayed alive for " + $scope.timeLasted + " seconds!";
       console.log(report);
       alert(report);
   };
   
   $scope.chessToDests = function(chess) {
       var dests = {};
       chess.SQUARES.forEach(function(s) {
	       var ms = chess.moves({square: s, verbose: true});
	       if (ms.length) dests[s] = ms.map(function(m) { return m.to; });
	   });
       return dests;
   }

   $scope.initialize();
    });