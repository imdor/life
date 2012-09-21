var CanvasView = function(){
	var my = this;
	my.title = 'Canvas Realization'
	var canvas = cm.Node('canvas', {'height' : 300, 'width' : 300});
	var matrix = [];
	var drawSpeed = 1;
	var border = 1;
	
	my.getContainer = function(){
		return canvas;
	};
	
	my.drawNextGeneration = function(generation){
		var i = 0;
		generation.forEach(function(line, y){
			line.forEach(function(cell, x){
				if(cell == matrix[y][x].isDead()){
					matrix[y][x][cell? 'live' : 'die']();
				}
			});
		});
		return my;
	};
	my.drawCurrentGeneration = function(generation){
		var timeout = 0;
		if(generation.length && generation[0].length)
			drawLayout(generation[0].length, generation.length);
			
		generation.forEach(function(line, y){
			matrix[y] = [];
			line.forEach(function(cell, x){
				matrix[y][x] = new Cell({
					'x' : x,
					'y' : y,
					'abscissa' : line.length,
					'ordinate' : generation.length,
					'canvas' : canvas
				});
				window.setTimeout(matrix[y][x][cell? 'live' : 'die'], drawSpeed*timeout++);
			});
		});
		return my;
	};
	
	var drawLayout = function(abscissa, ordinate){
		canvas.width = canvas.width;
		var context = canvas.getContext('2d');
		var xStep = canvas.width/abscissa;
		var yStep = canvas.height/ordinate;
		context.fillStyle = "rgba(0, 0, 0, 1)";
		for(var i = 0; i <= abscissa; i++){
			context.fillRect(parseInt(i*xStep - border/2), 0, border, canvas.height);
		}
		for(var i = 0; i <= ordinate; i++){
			context.fillRect(0, parseInt(i*yStep - border/2), canvas.height, border);
		}
		return my;
	};
	
	/*** Local Class ***/
	var Cell = function(){
		var my = this;
		var args = cm.merge({ /*default arguments*/
			'x' : 0,
			'y' : 0,
			'padding' : 3,
			'abscissa' : 0,
			'ordinate' : 0,
			'animationDuration' : 200,
			'canvas' : {}
		}, arguments[0]);
		var dead = 1;
		var inprogress = true;
		var context = args.canvas.getContext('2d');
		var width = args.canvas.width / args.abscissa;
		var height = args.canvas.height / args.ordinate;
		var top = parseInt(height * args.y + args.padding);
		var left = parseInt(width * args.x + args.padding);
			width = parseInt(width - args.padding*2)
			height = parseInt(height - args.padding*2)
		var currentAlpha = 0;
		var animProcess = [];
		var pStack = [];
		my.draw = function(){
			context.clearRect(left, top, width, height);
			context.fillStyle = "rgba(0, 0, 0, " + currentAlpha + ")";
			context.fillRect(left, top , width, height);
			return my;
		};
		my.live = function(){
			if(!dead) return my;
			dead = 0;
			animate();
			return my;
		};
		my.die = function(){
			if(dead) return my;
			dead = 1;
			animate();
			return my;
		};
		var animate = function(){
			var to = dead? 0 : 1;
			var from = currentAlpha;
			var duration = Math.abs(currentAlpha - to) * args.animationDuration;
			var start = new Date().getTime();
			var processId = Math.random();
			pStack = [];
			pStack.push(processId)
			animFrame(function(){
				if(pStack.indexOf(processId) == -1) 
					return false;
				var progress = (new Date().getTime() - start)/duration;
				if(progress < 1){
					currentAlpha = progress*(to - from) + from;
					my.draw();
					animFrame(arguments.callee);
				}else{
					currentAlpha = to;
					my.draw(to);
				}
			});
			return true;
		};
		my.isDead = function(){
			return dead;
		};
		var animFrame = (function(){ 
			return	window.requestAnimationFrame	||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame		||
				function(callback, element){ window.setTimeout(callback, 1000 / 60); }; 
		})();
	};
};