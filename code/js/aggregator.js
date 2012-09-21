var Aggregator = function(){
	var my = this;
	var views = [];
	var game = null;
	var interval = null;
	var period = 500;
	var node = {};
	var generationNumber = 0;
	var patterns = [
		{'title' : 'Blinker', 'value' : 'blinker'},
		{'title' : 'Toad', 'value' : 'toad'},
		{'title' : 'Beacon', 'value' : 'beacon'},
		{'title' : 'Pulsar', 'value' : 'pulsar'}
	];
	
	
	my.render = function(){
		node.root = cm.Node('div', {'class' : 'application'},
			cm.Node('fieldset',
				cm.Node('legend', 'Upload predefined pattern from server Or input your own'),
				cm.Node('div', {'class' : 'buttons'}, renderButtons()),	
				cm.Node('div', {'class' : 'textarea'}, node.textarea = cm.Node('textarea')),
				cm.Node('div', {'class' : 'controls'}, 
					cm.Node('div',
						node.prepare = cm.Node('input', {'type' : 'button', 'value' : 'Prepare'}),
						cm.Node('label', 'You must prepare pattern first')
					),
					cm.Node('div',
						node.next = cm.Node('input', {'type' : 'button', 'value' : 'Next Generation'}),
						node.generation = cm.Node('input', {'type' : 'text', 'readonly' : 'readonly', 'value' : generationNumber})
					),
					cm.Node('div',
						node.loop = cm.Node('input', {'type' : 'button', 'value' : 'Loop'}),
						node.period = cm.Node('input', {'type' : 'text', 'pattern' : '[0-9]+', 'value' : period, 'placeholder' : 'Period ms'})
					)
				)
			),
			cm.Node('div', renderViews())
		);
		/*** default pattern ***/
		node.textarea.value = '0000000000\n' +
		                      '0000000000\n' +
		                      '0000000000\n' +
		                      '0000000000\n' +
		                      '0000111000\n' +
		                      '0001110000\n' +
		                      '0000000000\n' +
		                      '0000000000\n' +
		                      '0000000000\n' +
		                      '0000000000';
		node.next.addEventListener('click', nextHandler);
		node.loop.addEventListener('click', loopHandler);
		node.prepare.addEventListener('click', prepareHandler);
		return node.root;
	};
	var renderViews = function(){
		var container = document.createDocumentFragment();
		views.forEach(function(item){
			container.appendChild(cm.Node('fieldset',
					cm.Node('legend', item.title),
					item.getContainer()
				)
			);
		});
		return container;
	};
	
	var renderButtons = function(){
		var container = document.createDocumentFragment();
		patterns.forEach(function(item){
			var node = cm.Node('input', {'type' : 'button', 'value' : item.title});
			container.appendChild(node);
			node.addEventListener('click', function(){patternHandler(item.value);})
		});
		return container;
	};
	
	
	/***
		I am trying do not use event.target property instead local scope
	**/
	
	
	var patternHandler = function(txt){
		cm.startWorkingBoxAnimation(document.querySelector('.buttons'), document.querySelector('.textarea'));
		cm.altReq({
			'url' : 'code/php/gameoflife.php',
			'params' : '?pattern=' + txt,
			'handler' : function(txt){
				cm.stopWorkingBoxAnimation(document.querySelector('.buttons'), document.querySelector('.textarea'));
				try{
					var res = JSON.parse(txt);
					node.textarea.value = '';
					res.forEach(function(o){
						node.textarea.value += o + '\n';
					});
				}catch(e){
					alert('Wrong server resonse!');
				}
			}
		})
	};
	
	var loopHandler = function(){
		if(interval != null){
			window.clearInterval(interval);
			interval = null;
			node.loop.value = 'Loop';
			node.prepare.disabled = false;
			node.next.disabled = false;
			node.period.disabled = false;
			return true;
		}
		if(!/^[0-9]+$/.test(node.period.value)){
			alert('Only integers allowed in loop period field')
			return false;
		}
		node.loop.value = 'Stop';
		node.prepare.disabled = true;
		node.next.disabled = true;
		node.period.disabled = true;
		startLoop();
		interval = window.setInterval(startLoop, node.period.value);
		return true;
	};
	
	var startLoop = function(){
		nextHandler();
	};
	
	var nextHandler = function(){
		node.generation.value = ++generationNumber;
		draw(game.getNextGaneration());
	};
	
	var prepareHandler = function(){
		var arr = format(node.textarea.value);
		if(!arr)
			return false;
		node.generation.value  = generationNumber = 0;
		game.setFirstGeneraton(arr);
		views.forEach(function(item){
			item.drawCurrentGeneration(game.getCurrentGeneration());
		});
	};

	var	draw = function(generation){
		views.forEach(function(item){
			item.drawNextGeneration(generation);
		});
	};
	
	var format = function(txt){
		if(!txt){
			alert('Textarea should be filled. If you do not want to do this - just click on one of patterns button');
			return false;
		}
		else if(!/^[0-1\n\r]+$/g.test(txt)){
			alert('Sorry, only "1" and "0" symbols allowed');
			return false;
		}
		var ln = 0, flag = false;
		var matrix = []
		txt.split(/\n/).forEach(function(item){
			item = item.replace(/[^0-9]/g, '');
			if(!item.length){
				return;
			}if(ln != 0 && ln != item.length){
				flag = true;
			}else{
				matrix.push(item);
				ln = item.length;
			}
		});
		if(flag){
			alert('All rows should be same length');
			return false;
		}
		return matrix;
	}
	
	
	my.addView = function(view){
		views.push(view);
		return my;
	};
	
	my.addGame = function(gol){
		game = gol;
		return my;
	}
};