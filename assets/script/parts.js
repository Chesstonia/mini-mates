(function() {
    var boardModule = angular.module("boardModule", []);
    var boardCount = 1;

    boardModule.directive("chessBoard", function(){
        return {
	    restrict: 'E',
	    scope: { },
	    template: '<div id="board" class="chessground small blue cburnett"></div>',
	    controller: function($scope){
		this.onDrop = function(){
		    console.log(arguments);
		};

		this.board = Chessground(document.getElementById("board"));
	    }
        };
    });

    var app = angular.module("partsApp", ["boardModule"]);

})();