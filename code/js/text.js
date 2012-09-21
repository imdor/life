var TextView = function(){
	var my = this;
	my.title = 'Old School Text Realization'
	var container = cm.Node('div', {'style' : 'display:inline-block;white-space:pre;font-family:Consolas, Lucida Console;background:#000;color:green;'});

	
	my.getContainer = function(){
		return container;
	};
	
	my.drawNextGeneration = function(generation){
		container.innerHTML = '';
		generation.forEach(function(line){
			container.innerHTML += line.join('').replace(/0/g, '.').replace(/1/g, '0') + '\n';
		});
		return my;
	};
	my.drawCurrentGeneration = function(generation){
		container.innerHTML = '';
		generation.forEach(function(line){
			container.innerHTML += line.join('').replace(/0/g, '.').replace(/1/g, '0') + '\n';
		});
		return my;
	};
	
};