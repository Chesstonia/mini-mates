var app = angular.module("superman", []).controller("SimpleController", function($scope, $interval){
	   $scope.startingFEN = "4k3/8/8/8/8/8/8/RNBQKBNR w - - 0 1";
	   $scope.chess = new Chess($scope.startingFEN);

	   $scope.chessToDests = function(chess) {
	       var dests = {};
	       chess.SQUARES.forEach(function(s) {
		       var ms = chess.moves({square: s, verbose: true});
		       if (ms.length) dests[s] = ms.map(function(m) { return m.to; });
		   });
	       return dests;
	   }

	   $scope.onDrop = function(source, target, piece, newPosition, oldPosition, orientation){
	       var move = $scope.chess.move({from: source, to: target});
	       var responses = $scope.chess.moves();
	       if (responses.length == 0){
		   if (move.san.includes("#")){
		       $scope.chess.remove(target);
		       responses = $scope.chess.moves();
		   } else {
		       alert("YOU LOSE");
		       $("#ground7").hide();
		       return;
		   }
	       }
	       var response = responses[0];
	       $scope.chess.move(response);
	       $scope.ground.set({
		       fen: $scope.chess.fen(),
		       movable: {
			   dests: $scope.chessToDests($scope.chess),
			   showDests: false
		       }
		   });
	   }

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
		       dests: $scope.chessToDests($scope.chess),
		       showDests: false,
		       events: {
			   after: $scope.onDrop
		       }
		   },
		   drawable: {
		       enabled: true
		   },
		   orientation: "white",
		   turnColor: "white",
		   fen: $scope.startingFEN
	       });
    });