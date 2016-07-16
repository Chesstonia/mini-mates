(function() {
    var app = angular.module("partsApp", []);

    app.directive("chessBoard", function(){
        return {
	    restrict: 'E',
	    template: '<div id="board" class="chessground small blue cburnett"></div>',
	    controller: function(){
		this.onDrop = function(){
		    console.log(arguments);
		};

		var options = {
		    viewOnly: false,
		    animation: {
		        enabled: false
		    },
		    highlight: {
                        lastMove: false,
			check: false
		    },
		    movable: {
			free: true,
			dropoff: "revert",
			premove: false,
			events: {
			    after: this.onDrop
			}
		    },
		    drawable: {
			enabled: true
		    }
		}
		this.board = Chessground(document.getElementById('board'), options);
	    }
        };
    });
})();