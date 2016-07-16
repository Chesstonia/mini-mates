var app = angular.module("superman", []).controller("SimpleController", function($scope, $interval){
	   $scope.buildFEN = function(pieces){
	       var fen = "K";
	       if (pieces['q'] == 1){
		   fen = "QK";
	       } else {
		   fen = "1K";
	       }
	       ["B","N","R"].forEach(function(piece) {
		   if (pieces[piece.toLowerCase()] == 2){
		       fen = piece + fen + piece;
		   }else if(pieces[piece.toLowerCase()] == 1){
	      	       fen = piece + fen + "1";
		   } else {
		       fen = "1" + fen + "1";
		   }
	       });
               var blanks = fen.match(/1+/g);
	       if (blanks != null)
		   blanks.forEach(function(str) { fen = fen.replace(str, str.length); }); // collapse multiple 1's together
	       fen = "4k3/8/8/8/8/8/8/" + fen + " w - - 0 1";
	       return fen;
	   }

  	   $scope.startingPieces = { 'r': 2, 'n': 2, 'b': 2, 'q': 1 };
	   $scope.startingFEN = $scope.buildFEN($scope.startingPieces);
	   $scope.pieces = $scope.startingPieces;
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
	       if (move.san.includes("#")) {
		   $scope.pieces[$scope.chess.get(target).type]--;
		   $scope.chess.load($scope.buildFEN($scope.pieces));
		   $scope.ground.set({
			   fen: $scope.chess.fen(),
			   movable: {
			     dests: $scope.chessToDests($scope.chess),
			     showDests: false
			   }
		   });
		   return;
	       }
	       var responses = $scope.chess.moves();
	       var response = null;
               responses.forEach(function(move){
		   if (move.includes("x")){
                       response = move;
		   }
	       });
	       if ((responses.length == 0) || (response != null)){
		   alert("YOU LOSE");
		   $("#ground7").hide();
		   return;
	       }
	       
	       response = responses[0];
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