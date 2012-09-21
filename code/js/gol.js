var Gol = function(){
	var my = this; //enclosing this context
	var generation = []; //current state
	/*
	* obviously I can use sum method to do calculation, in case if I creating app for
	* mobile devices or Smart TV and need to performance
	* eg: neighbors = cell[x-1][y-1] + cell[x][y-1] + ... + cell[x][y+1] + cell[x+1][y+1]
	* or even use flat array
	* but this is not hight-performance task, is not it? ;)
	*/
	var calculateNextGeneration = function(){
		var nextGeneration = [];
		generation.forEach(function(line, y){
			nextGeneration[y] = [];
			line.forEach(function(item, x){
				var neighbors = generation.slice(y>0? y-1 : 0, y+2).reduce(function(a, b){ //reduce much faster then eval([1,2,3, ... 8,9,10].join('+'));
					return a + b.slice(x>0? x-1 : 0, x+2).reduce(function(a,b){return a+b}, 0);
				},0) - generation[y][x];
				nextGeneration[y][x] = (generation[y][x]? [2,3].indexOf(neighbors) != -1 : neighbors == 3) + 0;
			});
		});
		return generation = nextGeneration;
	};
	my.setFirstGeneraton = function(incoming){
		if(!(incoming instanceof Array) || incoming.some(function(o){return typeof(o) != 'string';}))
			throw new Error('Wrong argument');
		generation = [];
		/*transfroming incoming data to bin matrix for more flexability*/
		incoming.forEach(function(str, y){
			generation.push(
				str.split('').map(function(item){
					return parseInt(item);
					}) //for some cases ;)
				);
		});
		return my;
	};
	my.getCurrentGeneration = function(){
		return generation;
	};
	my.getNextGaneration = function(){
		return calculateNextGeneration();
	};
};