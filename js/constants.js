var pong = {};

(function() {
	pong.Constants = function() {
		this.height = 	window.innerHeight;
	   	this.width = 	window.innerWidth;

	   	this.background = {
	   		height: 	750,
	   		width: 		1200
	   	};

		this.ball = {
			speed: 		this.width / 3.0,
			increase: 	1.05
		};

	    this.paddle = {
	    	height: 	120,
	    	width: 		18,
	    	offset: 	10,
	    	speed: 		this.height / 2.0
	    };
	    this.paddle.rightEdge = this.width - this.paddle.offset - this.paddle.width;
	    this.paddle.leftEdge = this.paddle.offset + this.paddle.width;

	    this.score = {
	    	winner:     10,
	    	size: 		48,
	    	offset: {
	    		x: 		80,
	    		y: 		10
	    	}
		};
		this.score.offset.rightNumber = this.width - this.score.offset.x - 0.6375 * this.score.size;
		this.score.offset.rightText = this.width - this.score.offset.x - 4.25 * this.score.size;
		this.score.font = {
			font: 		this.score.size + 'px verdana',
			fill: 		'#666'
		};
	}
})();