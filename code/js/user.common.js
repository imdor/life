/*
 *  Common Javascript
 *  author: "Ivan Doroshenko" <i.m.doroshenko@gmail.com>
 *
 */
/* v.1.6 |05.07.2011*/
/*
 *  added: addClass(); replaceClass(); removeClass(); isClass(); inArray(); addLeadZero(); setSelect(); a2o(); o2a(); getByAttr(); new Overlay(); new Dialogue();
 *  updated: Animation(); - now it also use current css styles
 *	updated: startWorkingBoxAnimation(); - now it also can use node object as argument
 *  updated: new Grid(); - added new params
 * */
/* v.1.5 |05.04.2011*/
/*
 *  added: clone(); merge();
 *  updated: getByClass(); - now it use getElementsGetByClassName if it is exist
 *  updated: Animation(); - now it is can get all arguments in oject
 *  added: altReq(); - equal to newXMLHTTPRequest but with short name and ability to get all arguments in object  
 * 
 * */
/* v.1.46|24.01.2011*/
/*
 * fixed: startWorkingBoxAnimation();
 * now it checkDimmer all the time
 **/
/* v.1.45|05.01.2011*/
/*
 * added: xml2arr();
 * !!! now first argument for Animation funct must be an object {'par':val, ...}
 **/
/* v.1.44|24.12.2010*/
/*
 * added: nextEl();prevEl();
 **/
/* v.1.43|08.12.2010*/
/*
 * added additional condition for 'if' cause in getByClass();
 * optimized regular expression in getByClass();
 * added: inArray();
 **/
/* v.1.42|04.12.2010*/
/*
 * added alt name for createXmlHttpRequestObject | request;
 **/
/* v.1.41|30.11.2010*/
/*
 * added: clearNode();
 **/
/* Started in 2009, when my company banned usege of all free libs in their projects
 * first functions, that I wroted for this file, were Node() and Animation();
 **/
var cm = common = new function(){
	var me = this;
	var IE6 = me.IE6 = !(navigator.appVersion.indexOf("MSIE 6.")==-1);
	var IE7 = me.IE7 = !(navigator.appVersion.indexOf("MSIE 7.")==-1);
	var IE8 = me.IE8 = !(navigator.appVersion.indexOf("MSIE 8.")==-1);
	this.doc = doc = document;
	/***************************** Working box animation ******************************/
	(function(){
		var dimmers = [];
		var dimmerOpacity = 0.6;
		var isFixed = function(o){
			var el = o;
			while(el && el.tagName.toLowerCase() != 'body'){
				if(getCSSStyle(el, 'position') == 'fixed'){
					return true;
				}
				el = el.parentNode
			}
			return false;
		}
		//var dimmerColor = '#fff';
		var startWorkingBoxAnimation = me.startWorkingBoxAnimation = function(){
			for(var i = 0, ln = arguments.length; i < ln; i++){
				var tmp = arguments[i];
				(function(){
					var id = tmp;
					var dimmerObject = getObjectFromDimmmersArray(id);
					if(!dimmerObject){
						dimmers.push({
							'node' : Node('div', {'class':'cmWorkingBoxAnimation', 'style':'display:block;'}),
							'owner' : typeof(id) == 'string'? getEl(id) : id,
							'interval' : null,
							'start' : function(){
								var my = this;
								if(my.interval == null){
									checkDimmer(my)
									my.interval = window.setInterval(function(){checkDimmer(my);}, 100);
									document.body.appendChild(my.node);
									my.node.style.position = isFixed(my.owner)? 'fixed' : '';
									my.a.go({'style' : {'opacity': dimmerOpacity}, 'duration' : 200});
								}
							},
							'stop' : function(){
								var my = this;
								my.a.go({'style' : {'opacity':0}, 'duration' : 200, 'onStop' : function(){
									if(my.node.parentNode)
										my.node.parentNode.removeChild(my.node);
									window.clearInterval(my.interval);
									my.interval = null;
								}});
							}
						});
						dimmerObject = dimmers[dimmers.length - 1];
						dimmerObject.a = new Animation(dimmerObject.node);
						setOpacity(dimmerObject.node, 0);
					}
					dimmerObject.start();
				})();
			}
		};
		var getObjectFromDimmmersArray = function(o){
			o = typeof(o) == 'string'? getEl(o) : o;
			for(var i = 0, ln = dimmers.length; i < ln; i++){
				if(dimmers[i].owner == o)
					return dimmers[i];
			}
			return null;
		}
		var stopWorkingBoxAnimation = me.stopWorkingBoxAnimation = function(){
			for(var i = 0, ln = arguments.length; i < ln; i++){
				var dimmerObject = getObjectFromDimmmersArray(arguments[i]);
				if(dimmerObject && dimmerObject.node.parentNode)
					dimmerObject.stop();
				continue;
			}
		}
		var checkDimmer = function(dimmer){
			dimmer.node.style.width = dimmer.owner.offsetWidth + 'px';
			dimmer.node.style.height = dimmer.owner.offsetHeight  + 'px';
			
			dimmer.node.style.textAlign = 'center';
			dimmer.node.style.fontSize = '20px';
			
			dimmer.node.style.top = getY(dimmer.owner) + 'px';
			dimmer.node.style.left = getX(dimmer.owner)  + 'px';
		}
	})();
	
	/****************************** Overlay *****************************/
	var Overlay = this.Overlay = function(){
		var o = cm.merge({
			'onDimmerClose' : false,
			'closeBtn' : false,
			'top' : '20%',
			'autoPosition' : true,
			'bgOpacity' : 0.25,
			'closed' : true,
			'title' : '',
			'content' : '',
			'width' : '600px',
			'anim' : 'fade',
			'zIndex' : 9000,
			'onClose' : function(){},
			'animSpeed' : 200
		}, arguments[0]||{});
		var me = this;
		var closeAnimation = {};
		var openAnimation = {};
		var main = cm.Node('div', {'class':'oo', 'style' : (o.zIndex != false? 'z-index:' + o.zIndex : '')});
		var closeBtn = cm.Node('div', {'class':'oo-c', 'style':'display:' + (o.closeBtn? 'block' : 'none')});
		var dimmer = cm.Node('div', {'class':'oo-bg'});
		var height = 0;
		me.closed = true; 
		me.title = cm.Node('div', {'class':'title'});
		me.content = cm.Node('div', {'class':'descr'});
		var container = cm.Node('div', {'class':'oo-d', 'style':'visibility:hidden;position:fixed;left:50%;'},
								closeBtn, me.title,	me.content);
		main.appendChild(dimmer);
		main.appendChild(container);
		var anim = {
			'container' : new cm.Animation(container),
			'dimmer' : new cm.Animation(dimmer)
		};
		setOpacity(dimmer, 0);
		me.set = function(n){return n? cm.merge(o, n) : false;}
		me.open = function(n){
			if(!me.closed)
				return false
			me.set(n);
			me.closed = false;
			clearNode(me.title).appendChild(isText(o.title));
			clearNode(me.content).appendChild(isText(o.content));
			dimmer.onclick = o.onDimmerClose? me.close : null;
			closeBtn.onclick = o.closeBtn? me.close : null;
			closeBtn.style.display = o.closeBtn? 'block' : 'none';
			document.body.insertBefore(main, document.body.firstChild);
			container.style.width = o.width||'';
						
			container.style.width = o.width||'';
			container.style.top = o.autoPosition? '50%' : o.top||'';
			container.style.marginLeft = - parseInt(container.offsetWidth/2) + 'px';
			container.style.marginTop = o.autoPosition? - parseInt(container.offsetHeight/2) + 'px' : '';
			
			main.style.zIndex = o.zIndex;
			
			openAnimation[o.anim]();
			
			if(o.autoPosition)
				me.redraw();
				
		}
		me.redraw = function(duration){
			if(height == container.offsetHeight && !me.closed)
				return window.setTimeout(function(){me.redraw(duration)}, 100);
			else if(me.closed)
				return false;
			height = container.offsetHeight;
			duration = duration || 100;
			anim.container.go({
				'style':{
					'width' : o.width||'',
					'top' : o.autoPosition? '50%' : o.top||'',
					'marginLeft' : - parseInt(container.offsetWidth/2) + 'px',
					'marginTop' :  o.autoPosition? - parseInt(container.offsetHeight/2) + 'px' : ''
				}, 'duration' : duration, 'onStop' : function(){ return !me.closed? me.redraw(duration) : false;}});
		}
		var isText = function(txt){
			if(typeof txt == 'string' || typeof txt == 'number')
				return doc.createTextNode(txt);
			return txt;
		}
		me.close = function(){
			if(me.closed)
				return false 
			o.onClose();
			me.closed = true;
			closeAnimation[o.anim]();
		}
		closeAnimation['fade'] = function(){
			anim.dimmer.go({'style' : {'opacity': 0}, 'duration' : o.animSpeed, 'onStop' : function(){
				document.body.removeChild(main);
			}});
			anim.container.go({'style' : {'opacity': 0}, 'duration' : o.animSpeed, 'onStop' : function(){
				setOpacity(container, 1);
				container.style.visibility = 'hidden';
			}});
		}
		openAnimation['fade'] = function(){
			container.style.visibility = 'visible';
			anim.container.go({'style' : {'opacity' : 1}, 'duration' : o.animSpeed});
			anim.dimmer.go({'style' : {'opacity': o.bgOpacity}, 'duration' : o.animSpeed});
		}
		
		closeAnimation['fromTop'] = function(){
			anim.dimmer.go({'style' : {'opacity': 0}, 'duration' : o.animSpeed, 'onStop' : function(){
				document.body.removeChild(main);
			}});
			anim.container.go({
				'style' : {'top':-(container.offsetHeight + 10) + 'px'},
				'duration' : o.animSpeed,
				'anim' :'inhibition',
				'onStop' : function(){
					container.style.visibility = 'hidden';
				}
			});
		}
		openAnimation['fromTop'] = function(){
			container.style.top = - (container.offsetHeight + 10) + 'px';
			container.style.visibility = 'visible';
			anim.container.go({'style' : {'top' : o.autoPosition? '50%' : o.top||''}, 'duration' : o.animSpeed, 'anim' : 'acceleration'});
			anim.dimmer.go({'style' : {'opacity': o.bgOpacity}, 'duration' : o.animSpeed});
		}
	}
	/****************************** Dialogue *****************************/
	var Dialogue = this.Dialogue = function(o){
		var me = this;
		var o = cm.merge({
				'title' : '',
				'text' : '',
				'params' : {},
				'buttons' : []
			}, arguments[0]||{});
		var checkedRows = [];
		var overlay = new Overlay({'closeBtn':false, 'onDimmerClose':false, 'zIndex' : 9001});
		me.set = function(n){
			if(n){
				cm.merge(o, n);
				o.buttons = n.buttons||o.buttons;
				return o;
			}
			return false;
		}
		me.open = function(n){
			me.set(n);
			var container = doc.createDocumentFragment();
			var buttons = cm.Node('div', {'class':'dialogue-buttons'});
			for(var i = 0, ln = o.buttons.length; i < ln; i++){
				var btn = cm.Node('input', {'type':'button', 'value':o.buttons[i].title});
				(function(){
					var k = i;
					btn.onclick = function(e){
						if(o.buttons[k].handler)
							o.buttons[k].handler(e);
						if(o.buttons[k].close || o.buttons[k].close !== false)
							overlay.close();
						return true;
					}
				})();
					
				buttons.appendChild(btn);
			}
			container.appendChild(cm.Node('div', {'class':'dialogue-text'}, o.text));
			container.appendChild(buttons);
			overlay.open(cm.merge(o.params, {'title':o.title, 'content':container}));
		}
		me.close = function(){
			overlay.close();
		}
	}
	/****************************** Grid list *****************************/
	//Required GridLit styles.
	var gridList = this.GridList = this.gridList = function(o, p){
		var me = this;
		var params = cm.merge({
			'checkboxes' : false,
			'rPerPage' : 10,
			'hidePagination' : false,
			'class' : ''
		}, p);
		var colums = o;
		var data = [];
		var ascendingSymbol = cm.Node('div', {'class':'cmGridListAscending'});
		/*search*/
		var searchValue = '';
		var searchColumn = '';
		/*sort*/
		var ascending = 1;
		var sortCol = '';
		var defaultSortColumn = null;
		/*pagination*/
	//	var rPerPage = 10;
		var dFrom = 0;

		var checked = me.checkedProp = '6b6574a157f61b0d6489c7912efffe39'; 
		
		var node = {};
		
		me.params = function(n){
			return (params = n? cm.merge(params, n) : params), me;
		}
		me.colums = function(n){
			return (colums = n? n : colums), me;
		}
		
		me.set = function(o){
			data = [];
			for(var i = 0, ln = o.length; i < ln; i++){
				o[i].listObject = me;
				data.push(o[i]);
			}
			return me;
		}
		
		me.render = function(){
			node['container'] = cm.addClass(cm.Node('div', {'class':'cmGridListContainer'},
						cm.Node('div'),
						cm.Node('div', {'class':'cmGridListTableContainer'},
								cm.Node('table', {'cellpadding':0, 'cellspacing':0, 'border':0, 'class':'cmGridListTable'},
										node['head'] = cm.Node('thead', {'class':'cmGridListHeader'}, createHeader()),
										node['body'] = cm.Node('tbody', {'class':'cmGridListRows'})
										)),
						cm.Node('div', cm.Node('div', {'class': (params.hidePagination? '' : 'cmGridListPages')}))
					), params['class']);
			return node['container'];
		}
		var createHeader = function(){
			var row = cm.Node('tr');
			if(params.checkboxes)
				row.appendChild(cm.Node('td', {'width':'20px'}));
			for(var i in colums){
				if(colums[i].fullLine)
					continue;
				var col = null;
				row.appendChild(colums[i].node = cm.Node('td', cm.Node('div', colums[i].title)));
				colums[i].node.style.width = colums[i].width? colums[i].width : ''; 
				if(colums[i].sort){
					if(colums[i].sort['default'])
						defaultSortColumn = colums[i];
					(function(){
						var k = i;
						colums[i].node.onclick = function(){
							clickSort(colums[k])
							return true;
						}
					})();
				}
			}
			return row;
		}
		var sortList = function(column, asc){
			ascending = column == defaultSortColumn && !sortCol? (defaultSortColumn.sort.asc || ascending) : (asc || ascending);
			
			var name = column.sort.name||column.name;
			var type = column.sort.type||'text';			
			sortCol = column;
			
			ascendingSymbol.className = ascending == 1? 'cmGridListAscending-asc' : 'cmGridListAscending-desc';
			column.node.appendChild(ascendingSymbol);
			
			sort(name, type);
		}
		var clickSort = me.clickSort = function(column){
			ascending = sortCol == column ? ascending * -1 : 1; 
			sortList(column);
			me.list();
		}
		var sort = function(name, type){
			switch(type){
				case 'text':
					data.sort(function(a, b){
						var x = a[name].toLowerCase();
						var y = b[name].toLowerCase();
						return y.replace(/\s/, '') == ''? 0 : (x < y ? -1 * ascending : (x > y ? 1 * ascending : 0));
					});
				break;
				case 'numeric':
					data.sort(function(a, b){
						var x = parseInt(a[name]);
						var y = parseInt(b[name]);
						return (x < y ? 1 * ascending : (x > y ? -1 * ascending : 0));
					});
				break;
			}
			return true;
		}
		
		var createPagination = function(){
			var pCount = Math.ceil( data.length / params.rPerPage );
			dFrom = pCount <= 1 ? 0  : dFrom;
			var cPage = Math.ceil( dFrom / params.rPerPage );
			var paginationContainer = cm.getByClass('cmGridListPages', node['container']);
				
			for(var k = 0, lnk = paginationContainer.length; k < lnk; k++){	
				clearNode(paginationContainer[k]);
				if(pCount < 2)
					continue;
				for(var i = 0; i < pCount; i++){
					if(!((i == 0 || i == pCount - 1) || (i >= cPage - 1 && i <= cPage + 1))){
						if( i == 1 && cPage > 2)
						{
							var p = cm.Node('div', '...');
							(function(){
								p.onclick = function(){
									dFrom = parseInt(cPage/2) * params.rPerPage;
									list();
								}
							})();
							paginationContainer[k].appendChild(p);
						}
						else if( i == pCount - 2 && cPage < pCount - 3 ){
							var p = cm.Node('div', '...');
							(function(){
								p.onclick = function(){
									dFrom = parseInt((cPage + pCount) / 2) * params.rPerPage;
									list();
								}
							})();
							paginationContainer[k].appendChild(p);
						}
						continue;
					}
					var p = cm.Node('div', {'innerHTML' : i == cPage? '<b>' + (i + 1) + '</b>' : i + 1});
					(function(){
						var cp = i;
						p.onclick = function(){
							dFrom = cp * params.rPerPage;
							list();
						}
					})();
					paginationContainer[k].appendChild(p);
				}
			}/*
			setInnerHTML(dFromContainer, parseInt(tabs[currentTab].dFrom + 1));
			setInnerHTML(dToContainer, parseInt(tabs[currentTab].dFrom + tabs[currentTab].rPerPage > data.length? data.length : tabs[currentTab].dFrom + tabs[currentTab].rPerPage));
			setInnerHTML(dOfContainer, parseInt(data.length));*/
		}
		me.getItems = function(){return data;}
		var getSelectedItems = me.getSelectedItems = function(){
			for(var i = 0, tmp = [], ln = data.length; i < ln; i++ ){
				if(data[i][checked])
					tmp.push(data[i]);
			}
			return tmp;
		}
		var deleteSelectedItems = me.deleteSelectedItems = function(){
			for(var i = 0, items = getSelectedItems(), ln = items.length; i < ln; i++){
				deleteItem(items[i], true);
			}
			list();
			return true;
		}
		var deleteItem = me.deleteItem = function(item, noRenew){
			for(var i = 0, ln = data.length; i < ln; i++ ){
				if(data[i] == item){
					data.splice(i, 1);
					return noRenew? true : list();
				}
			}
			return false;
		}
		var list = me.list = function(){
			cm.clearNode(node['body']);
			createPagination();
			if(sortCol||defaultSortColumn)
				sortList(sortCol||defaultSortColumn);
			for(var n = 0, ln = params.rPerPage; n < ln; n++){
				var i = n + dFrom;
				if(!data[i])
					break;
				var row = cm.Node('tr', {'class': (n%2? 'cmGridListEvenRow' : '')});
				var box = document.createDocumentFragment();
				box.appendChild(row);
				if(params.checkboxes){
					(function(){
						var k = i, chbx = cm.Node('input', {'type':'checkbox'});
						chbx.checked = !!data[i][checked];
						chbx.onclick = function(){data[k][checked] = chbx.checked;}
						row.appendChild(cm.Node('td', {'style':'width:20px'}, chbx));
					})()
				}
				for(var k in colums){
					//data[i][colums[k].name] = data[i][colums[k].name]||'';
					var tmp = null;
					var txt = (colums[k]['contentHandler']||function(item, content){return content;})(data[i], typeof(data[i][colums[k].name]) != 'undefined'?
						(typeof(data[i][colums[k].name]) == 'object' ? data[i][colums[k].name] : data[i][colums[k].name]) : 
						(colums[k]['default'] && colums[k]['default'].nodeType == 1? colums[k]['default'].cloneNode(true) : colums[k]['default']||''));
					txt = typeof(txt) == 'string'? cm.Node('div', {'innerHTML' : txt}) : txt;
					if(!colums[k].fullLine){
						row.appendChild(cm.Node('td', tmp = cm.Node('div',
								{'class':'cmGridListEvenCellContent', 'style':'width:' + (colums[k].width? (parseInt(colums[k].width) - 7 )+ 'px' : '')},
								txt)));
					}else if(txt){
						box.appendChild(cm.Node('tr', cm.Node('td', {'colspan':colums.length - 1}, tmp = cm.Node('div', {'class':'cmGridListEvenCellContent descr'}, txt))));
					}else{
						continue;
					}
					
					row.onmouseover = function(){
						this.style.backgroundColor = '#f8fcef';//'#ffff99'; 
					}
					if(colums[k]['white-space']){
						switch(colums[k]['white-space']){
							case 'nowrap':
								tmp.title = typeof(data[i][colums[k].name]) == 'string'? data[i][colums[k].name] : '';
							default:
								tmp.style.whiteSpace = colums[k]['white-space'];
						}
					}else{
						tmp.title = typeof(data[i][colums[k].name]) == 'string'? data[i][colums[k].name] : '';
					}
					if(colums[k].handler){
						(function(){
							var c = i;
							var e = k;
							tmp.onclick = function(){
								colums[e].handler(data[c]);
							}
							tmp.className = 'cmGridListEvenCellContent cmGridListLink';
						})();
					}
					row.onmouseout = function(){
						this.style.backgroundColor = '';
					}
				}
				node['body'].appendChild(box);
			}
			if(!n)
				node['body'].appendChild(cm.Node('tr', {'class': (n%2? 'cmGridListEvenRow' : '')}, cm.Node('td', {'colspan':colums.length}, cm.Node('div',
						{'class':'cmGridListEvenCellContent'}, 'No entries.'))));
			return me;
		}
	}
	
	/****************************** Hash function *****************************/
	var loadHashData = this.loadHashData = function(){
		var hash = document.location.hash.replace('#','').split('&');
		window.userRequest = {};
		for(var i = 0; hash.length > i; i++){
			window.userRequest[hash[i].split('=')[0]] = hash[i].split('=')[1]; 
		}
		return true;
	}
	var reloadHashData = this.reloadHashData = function(){
		var hash = '#';
		for(var name in window.userRequest){
			hash += name + '=' + window.userRequest[name];
		}
		document.location.hash = hash;
		return true;
	}
	/****************************** AJAX *****************************/
	var obj2URI = this.obj2URI = function(obj, prefix) {
		var str = [];
		for(var p in obj) {
			var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			str.push(typeof v == "object" ? obj2URI(v, k) : k + "=" + encodeURIComponent(v));
		}
		return str.join("&");
	}
	var createXmlHttpRequestObject = this.createXmlHttpRequestObject = function(){
		var xmlHttp;
		try	{
			xmlHttp = new XMLHttpRequest();
		}
		catch(e){
			var XmlHttpVersions = new Array("MSXML2.XMLHTTP.6.0",
			"MSXML2.XMLHTTP.5.0",
			"MSXML2.XMLHTTP.4.0",
			"MSXML2.XMLHTTP.3.0",
			"MSXML2.XMLHTTP",
			"Microsoft.XMLHTTP");
			for (var i=0; i<XmlHttpVersions.length && !xmlHttp; i++){
				try{
					xmlHttp = new ActiveXObject(XmlHttpVersions[i]);
				}
				catch (e) {}
			}
		}
		if (!xmlHttp)
			alert("Error creating the XMLHttpRequest object.");
		else
			return xmlHttp;
	}
	var newXMLHTTPRequest = this.newXMLHTTPRequest = this.request = function(req, params, method, handler, type){
		var type = (type && type.toLowerCase() == 'text')? 'responseText' : 'responseXML';
		var url = (method == 'POST' || method == 'post')? req : req + params;
		var httpRequestObject = createXmlHttpRequestObject();
		httpRequestObject.open(method, url, true);
		httpRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		httpRequestObject.onreadystatechange = (handler != null)? function(){ if (httpRequestObject.readyState == 4) { handler(httpRequestObject[type])}} : null;
		(method == 'POST' || method == 'post')? httpRequestObject.send(params) : httpRequestObject.send(null);
	}
	var altReq = this.altReq = function(){
		var o = merge({
				'type' : 'text',
				'method' : 'get',
				'params' : '',
				'url' : '',
				'handler' : function(){},
				'httpRequestObject' : false
		}, arguments[0]);
		var type = (o.type && o.type.toLowerCase() == 'text')? 'responseText' : 'responseXML';
		var method = o.method || 'post';
		var params = o.params || '';
		var url = (method.toLowerCase() == 'post')? o.url : o.url + params;
		var httpRequestObject = o.httpRequestObject? o.httpRequestObject : createXmlHttpRequestObject();
		httpRequestObject.open(method, url, true);
		httpRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
		httpRequestObject.onreadystatechange = (o.handler)? function(){ if (httpRequestObject.readyState == 4) { o.handler(httpRequestObject[type], httpRequestObject.status)}} : null;
		(method.toLowerCase() == 'post')? httpRequestObject.send(params) : httpRequestObject.send(null);
		return httpRequestObject;
	}
	var xml2arr = this.xml2arr = function(o){
		o = o.nodeType == 9? firstEl(o) : o;
		if(o.nodeType == 3 || o.nodeType == 4){
			//Need to be change
			var n = nextEl(o);
			if(!n)
				return o.nodeValue;
			o = n;
		}
		if(o.nodeType == 1){
			var res = {};
			res[o.tagName] = {};
			for(var i = 0, ln = o.childNodes.length; i < ln; i++){
				var childs = arguments.callee(o.childNodes[i]);
				if(typeof(childs) == 'object'){
					for(var key in childs){
						if(!res[o.tagName][key])
							res[o.tagName][key] = childs[key];
						else if(res[o.tagName][key]){
							if(!res[o.tagName][key].push)
								res[o.tagName][key] = [res[o.tagName][key], childs[key]];
							else
								res[o.tagName][key].push(childs[key]);
						}
					}
				}else{
					res[o.tagName] = childs;
				}
			}
			res[o.tagName] = ln? res[o.tagName] : '';
			return res;
		}
	}
	var responseInArray = this.responseInArray = function(xmldoc)
	{
		var response = xmldoc.getElementsByTagName('response')[0];
		var data = new Array();
		for(var i = 0; response.childNodes.length > i; i++){
			if(response.childNodes[i].nodeType != 1)
				continue;
			var kids = response.childNodes[i].childNodes;
			var tmp = new Array();
			for(var k = 0; kids.length > k; k++){
				if(kids[k].nodeType == 1)
					tmp[kids[k].tagName] = kids[k].firstChild? kids[k].firstChild.nodeValue : '';
			}
			data.push(tmp);
		}
		return data;
	}
	var getTxtVal = this.getTxtVal = function(o){return o.nodeType == 1 && o.firstChild? o.firstChild.nodeValue : '';}
	/****************************** Note *****************************/
	var showNote = this.showNote = function(txt){
		if(typeof(noteDiv) == 'undefined'){
			noteDiv = Node('div', {'class':'notification'});
			noteAnim = new Animation(noteDiv);
			setOpacity(noteDiv, 0);
			document.body.appendChild(noteDiv);
		}
		
		noteDiv.style.display = 'block';
		noteDiv.innerHTML = txt;
		noteDiv.style.top = (getBodyScrollTop() -  noteDiv.offsetHeight + (document.documentElement.clientHeight)/2) + 'px';
		noteDiv.style.left = (screen.width - noteDiv.offsetWidth)/2 + 'px';
		noteAnim.go({'style' : {'opacity' : '0.8'}, 'duration' : 500, 'onStop' : function(){
			window.setTimeout(function(){noteAnim.go(['opacity:0'], 500, 'simple', function(){noteDiv.style.display = 'none';})}, 2000);
		}});
	}
	/****************************** Scroll *****************************/
	var getBodyScrollTop = this.getBodyScrollTop = function(){return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);	}
	/****************************** Events ******************************/
	var getEvent = this.getEvent = function(e){return e || event;}
	var stopPropagation = this.stopPropagation = function(e){return e.stopPropagation? e.stopPropagation() : e.cancelBubble = true;}
	var getObjFromEvent = this.getObjFromEvent = this.getEventObject = this.getEventTarget = function(e){return  e.target || e.srcElement;}
	var addEvent = this.addEvent = function(elem, type, handler, bubbling){try{elem.addEventListener(type, handler, typeof(bubbling) == 'undefined'? true : bubbling);}catch(e){elem.attachEvent("on"+type, handler);}}
	var removeEvent = this.removeEvent = function(elem, type, handler){try{elem.removeEventListener(type, handler, true);}catch(e){elem.detachEvent("on"+type, handler);}}
	var onload = this.onload = function(handler){try{addEvent(window, 'load', handler);}catch(e){}};
	/****************************** Get Element Adjustments ******************************/
	var getX = this.getX = function(o){var x=0;try{while(o){x+=o.offsetLeft;o=o.offsetParent;}}catch(e){return x;};return x;};
	var getY = this.getY = function(o){var y=0;try{while(o){y+=o.offsetTop;o=o.offsetParent;}}catch(e){return y;};return y;};
	/******************************** Get Element ********************************/
	var getEl = this.getEl = function(id){return document.getElementById(id);};
	var getByAttr = this.getByAttr = function(attr, value, element){
		var p = element||document;
		if(p.querySelectorAll)
			return p.querySelectorAll("[" + attr + "='" + value + "']");
		var elements = p.getElementsByTagName('*');
		var stack = [];
		for(var i = 0, ln = elements.length; i < ln; i++){
			if(elements[i].getAttribute(attr) == value)
				stack.push(elements[i]);
		}
		return stack;
	};
	var getByClass = this.getByClass = function(str, o){
		o = o || document;
		if(o.getElementsByClassName)
			return o.getElementsByClassName(str);
		//var n = new RegExp('(?:\\s|^)' + str + '(?=\\s|$)');
		var nodes = o.getElementsByTagName('*');
		var rValue = [];
		for(var d in nodes){
			//if(nodes[d] && nodes[d].nodeType == 1 && n.test(nodes[d].className))
			if(nodes[d] && nodes[d].nodeType == 1 && isClass(nodes[d], str))
				rValue.push(nodes[d]);
		}
		return rValue;
	}
	var getIFrameDOM = this.getIFrameDOM = function (o){
		return o.contentDocument ||o.document;
	}
	/******************************** Node classes *******************************/	
	var replaceClass = this.replaceClass = function(o, oldOne, newOne){
		if(!o) return null;
		return addClass(removeClass(o, oldOne), newOne);
	}
	var addClass = this.addClass = function(o, str){
		if(!o) return null;
		var add = a2o(typeof(str) == 'object'? str : str.split(/\s+/));
		var current = a2o(o && o.className? o.className.split(/\s+/) : []);
		merge(current, add);
		o.className = o2a(current).join(' ');
		return o;
	}
	var removeClass = this.removeClass = function(o, str){
		if(!o) return null;
		var remove = a2o(typeof(str) == 'object'? str : str.split(/\s+/));
		var current = o && o.className? o.className.split(/\s+/) : [];
		var ready = [];
		for(var i = 0, ln = current.length; i < ln; i++){ if(!remove[current[i]]){ready.push(current[i]);}}
		o.className = ready.join(' ');
		return o;
	}
	var isClass = this.isClass = function(o, str){
		if(!o) return null;
		var classes = o && o.className? o.className.split(/\s+/) : [];
		for(var i = 0, ln = classes.length; i < ln; i++){
			if(classes[i] == str)
				return true;
		}
		return false;
	}
	/******************************** Get Page Size ********************************/
	var getPageSize = this.getPageSize = function()
	{
		return {
			'h': Math.max(
				Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight),
				Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight),
				Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
			),
			'w' : Math.max(
				Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth),
				Math.max(doc.body.offsetWidth, doc.documentElement.offsetWidth),
				Math.max(doc.body.clientWidth, doc.documentElement.clientWidth)
			),
			'winH' : doc.documentElement.clientWidth,
			'winW' : doc.documentElement.clientHeight
		};
	}
	/******************************** Set opacity ********************************/
	var setOpacity = this.setOpacity = function(elem, val){
		if(elem){
			if(IE6 || IE7 || IE8)
				elem.style.filter = "alpha(opacity=" + (Math.floor(val * 100)) + ")";
			else
				elem.style.opacity = val;
		}
	}
	/******************************** Node builder ********************************/
	var Node = this.Node = this.N = function(){
		var el = document.createElement(arguments[0]);
		if(typeof arguments[1] == "object" && !arguments[1].nodeType){
			for(var i in arguments[1]){
				switch(i){
					case 'style':
						el.style.cssText = arguments[1][i];
					break;
					case 'class':
						el.className = arguments[1][i];
					break;
					case 'innerHTML':
						el.innerHTML = arguments[1][i];
					break;
					default:
						el.setAttribute(i, arguments[1][i]);
				}
			}
			i = 2;
		}
		else
			i = 1;
		
		for(var ln = arguments.length; i < ln; i++)	{
			el.appendChild(/string|number/.test(typeof(arguments[i]))? document.createTextNode(arguments[i]) : arguments[i]);
		}
		return el;
	}
	/******************************** Nodes ********************************/
	var inDOM = this.inDOM = function(o) {
		if(document.compareDocumentPosition)
			return !!(document.compareDocumentPosition(o) & 16);
		while (o = o.parentNode) {
			if (o == document) {
				return true;
			}
		}
		return false;
	}
	var isParent = this.isParent = function(p, o){
		if(p.compareDocumentPosition)
			return !!(p.compareDocumentPosition(o) & 16);
		if(o && o.parentNode){
			var el = o.parentNode;
			do{
				if(el == p){
					return true;
				}
			}while(el = el.parentNode);
		}
		return false;
	}
	var nextEl = this.nextEl = function (o){
		if(!o) return null;
		var c = o;
		do{c = c.nextSibling;}while(c && c.nodeType != 1);
		return c;
	}

	var prevEl = this.prevEl = function(o){
		if(!o) return null;
		var c = o;
		do{c = c.previousSibling;}while(c && c.nodeType != 1);
		return c;
	}
	var firstEl = this.firstEl = function(o){
		return o && o.firstChild? (o.firstChild.nodeType == 1? o.firstChild : nextEl(o.firstChild)) : false;
	}
	var clearNode = this.clearNode = function(o){
		if(!o) return o;
		while(o.firstChild){
			o.removeChild(o.firstChild);
		}
		return o;
	}
	var insertFirst = this.insertFirst = function(el, parent)
	{
		var first = firstEl(parent);
		if(first){insertBefore(el, first); }else{ parent.appendChild(el); }
		return el;
	}
	var insertBefore = this.insertBefore = function(el, target)
	{
		target.parentNode.insertBefore(el, target);
		return el;
	}
	var insertAfter = this.insertAfter = function(el, target)
	{
		var before = target.nextSibling;
		if(before !=null){ insertBefore(el, before); }else{ el.parentNode.appendChild(el); }
		return el;
	}
	/***************************** Arrays & Objects *****************************/
	var o2a = this.o2a = function(o){
		if(typeof(o) != 'object')
			return [o];
		var a = [];
		for(var i in o){
			if(i)
				a.push(o[i]);
		}
		return a;
	}
	var a2o = this.a2o = function(a){
		var o = {};
		for(var i = 0, ln = a.length; i < ln; i++){
			o[a[i]] = a[i];
		}
		return o;
	}
	var merge = this.merge = function(){
		var stack = arguments[0];
		for(var k = 1, ln = arguments.length; k < ln; k++){
			var object = arguments[k];
			if(typeof(object) != 'object'){continue;}
			for(var i in object){
				if(!object.hasOwnProperty(i))
					continue;
				stack[i] = (typeof(stack[i]) == 'object' && object[i] && typeof(object[i]) == 'object' && !object[i].nodeType)?
						arguments.callee(stack[i], object[i]) : object[i]; 
			}
		}
		return stack;
	}
	var clone = this.clone = function(o, copyNode){
		var n = o.constructor == Object? {} : o.constructor == Array? [] : o.cloneNode(true);
		for(var i in o){
			if(!o.hasOwnProperty(i))
				continue;
			n[i] = (o[i] !== null && typeof(o[i]) == 'object' && o[i].constructor != RegExp)?
						(o[i].nodeType?
							(copyNode? o[i].cloneNode : o[i]) 
							:
							arguments.callee(o[i])) : o[i];
		}
		return n;
	}
	var isArray = this.isArray = Array.isArray || function(obj){return (obj)? obj.constructor == Array : false; };
	var inArray = this.inArray = function(needle, arr){
		var flag = false;
		for(var i in arr){
			if(arr[i] === needle){
				flag = true;
				break;
			}
		}
		return flag;
	}
	var addLeadZero = this.addLeadZero = function(x){
		x = parseInt(x, 10);
		return x < 10? '0' + x : x;
	}
	var setSelect = this.setSelect = function(o, v){
		var options = o.getElementsByTagName('option');
		for(var k = 0, ln = options.length; k < ln;
		options[k].selected = (typeof(v) == 'object'? inArray(options[k++].value, v) : options[k++].value == v)
		);
		return true;
	}
	var getLength = this.getLength = function(o)
	{
		var i = 0;
		for(var key in o){ if(o.hasOwnProperty(key)){ i++; } }
		return i;
	}
	/******************************** JSON ********************************/
	this.JSON = JSON||new function(){
		this.parse = function(txt){
			return eval('(' + txt + ')');
		}
		this.stringify = function(){
			return alert('!JSON');
		}
	}
	/******************************** Forms ********************************/
	var setFDO = this.setFDO = function(o, form){
		for(var name in o){
			var el = cm.getByAttr('name', name, form);
			
			for(var i = 0, ln = el.length; i < ln; i++){
				var type = (el[i].type||'').toLowerCase();
				switch(type){
					case 'radio':
						if(o[name] == el[i].value)
							el[i].checked = true;
						break;
					case 'checkbox':
						el[i].checked = !! + o[name];
						break;
					default:
						if(el[i].tagName.toLowerCase() == 'select')
							setSelect(el[i], o[name]);
						else
							el[i].value = o[name];
				}
			}
		}
		return form;
	}
	var getFDO = this.getFDO = function(o, chbx){
		var data = new Array();
		var elements = [
		o.getElementsByTagName('input'),
		o.getElementsByTagName('textarea'),
		o.getElementsByTagName('select')
		];
		var getMultiplySelect = function(o){
			var opts = o.getElementsByTagName('option');
			var val = [];
			for(var i in opts){
				if(opts[i].selected)
					val.push(opts[i].value);
			}
			return val;
		}
		var setValue = function(name, value){
			if(/\[.*\]$/.test(name)){
				var indexes = [];
				var re = /\[(.*?)\]/g;
				var results = null;
				while(results = re.exec(name)){
					indexes.push(results[1]);
				}
				name = name.replace(/\[.*\]$/, '')
				data[name] = (function(i, obj){
					var index = indexes[i];
					var next = typeof(indexes[i+1]) != 'undefined';
					if(index == ''){
						if(obj && obj instanceof Array)
							obj.push(next? arguments.callee(i+1, obj) : value);
						else
							obj = next? [arguments.callee(i+1, obj)] : value;//obj = [next? arguments.callee(i+1, obj) : value]
					}else{
						if(!obj || !(obj instanceof Object))
							obj = {};
						obj[index] = next? arguments.callee(i+1, obj[index]) : value;
					}
					return obj;
				})(0, data[name]);
			}else{
				data[name] = value;
			}
			return 1;
		}
		for(var d = 0, lnd = elements.length; d < lnd; d++){
			for(var i = 0, ln = elements[d].length; i < ln; i++){
				if(!elements[d][i].name.length)
					continue;
				switch(elements[d][i].tagName.toLowerCase()){
					case 'input':
						switch(elements[d][i].type.toLowerCase()){
							case 'radio':
								if(elements[d][i].checked)
									setValue(elements[d][i].name, elements[d][i].value||1);
								break;
							case 'checkbox':
								if(elements[d][i].checked)
									setValue(elements[d][i].name, elements[d][i].value||1);
								else if(typeof(chbx) != 'undefined' && chbx !== false)
									setValue(elements[d][i].name, chbx);
								break;
							case 'password':
							case 'hidden':
							case 'text':
							default:
								setValue(elements[d][i].name, elements[d][i].value);
								break;
						}
						break;
					case 'textarea':
					case 'select':
						setValue(elements[d][i].name, (elements[d][i].multiple)? getMultiplySelect(elements[d][i]) : elements[d][i].value);
						break;
				}	

			}
		}
		return data;
	}
	var clearForm = this.clearForm = function(o){
		var formEls = cm.getByClass('formData', o);
		for(var i = 0, ln = formEls.length; i < ln; i++){
			if(formEls[i].tagName.toLowerCase() == 'input'){
				if(formEls[i].type.toLowerCase() == 'checkbox' || formEls[i].type.toLowerCase() == 'radio')
					formEls[i].checked = false;
				else
					formEls[i].value = '';
			}else if(formEls[i].tagName.toLowerCase() == 'textarea')
				formEls[i].value = '';
			else if(formEls[i].tagName.toLowerCase() == 'select'){
				var opts = formEls[i].getElementsByTagName('option');
				for(var d = 0, lnd = opts.length; d < lnd; d++){
					opts[d].selected = false;
				}
			}
		}
		return o;
	}
	var setSelect = this.setSelect = function(o, v){
		var options = o.getElementsByTagName('option');
		for(var k = 0, ln = options.length; k < ln;
		options[k].selected = (typeof(v) == 'object'? inArray(options[k++].value, v) : options[k++].value == v)
		);
		return true;
	}
	/******************************** Animation ********************************/
	var animFrame = (function(){ 
		return	window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame		||
				function(callback, element){ window.setTimeout(callback, 1000 / 60); }; 
	})();
	var Animation = this.Animation = function(o){
		var obj = o;
		var processes = new Array()
		var animationMethod = {
			'random' : function(progress){return (function(min, max){return Math.random() * (max - min) + min;})(progress, 1);},
			'simple' : function(progress){return progress;},
			'acceleration' : function(progress){return Math.pow(progress, 3);},
			'inhibition' : function(progress){return 1 - animationMethod.acceleration(1 - progress);},
			'smooth' : function(progress){return (progress < 0.5)? animationMethod.acceleration(2 * progress) / 2 : 1 - animationMethod.acceleration(2 * (1 - progress)) / 2;}
		};
		this.getTarget = function(){
			return obj;
		};
		this.go = function(){
			var args = cm.merge({
				'style' : '',
				'duration' : '',
				'anim' : 'simple',
				'animParams' : {},
				'onStop' : function(){}
			}, arguments[0]);

			var pId = 'animation_process_' + Math.random();
			var delta = animationMethod[args.anim]||animationMethod['simple'];
			var properties = [];
			for(var name in args.style){
				var value = args.style[name].toString();
				var dimension = getDimension(value);
				properties.push({
					'name' : name,
					'new' : prepareEndPosition(name, value),
					'dimension' : dimension,
					'old' : getStyle(name, dimension)
				});
			}
			var start = new Date().getTime();
			for(var i in processes){processes[i] = false;}
			processes[pId] = true;
			(function(){
				var processId = pId;
				if(!processes[processId]){
					delete processes[processId];
					return false;
				}
				var now = (new Date().getTime()) - start;
				var progress = now / args.duration;
				if(setProperties(progress, delta, properties)){
					delete processes[processId];
					args.onStop && args.onStop();
				}else{
					animFrame(arguments.callee);
				}
			})();
		}
		var setProperties = function(progress, delta, properties){
			if(progress < 1){
				for(var i = 0, ln = properties.length; i < ln; i++){
					var val = properties[i]['old'] + (properties[i]['new'] - properties[i]['old']) * delta(progress);
									
					if(properties[i]['name'] == 'opacity')
						setOpacity(obj, val);
					else if(/color/i.test(properties[i]['name'])){
						var r = parseInt((properties[i]['new'][0] - properties[i]['old'][0]) * delta(progress) + properties[i]['old'][0]);
						var g = parseInt((properties[i]['new'][1] - properties[i]['old'][1]) * delta(progress) + properties[i]['old'][1]);
						var b = parseInt((properties[i]['new'][2] - properties[i]['old'][2]) * delta(progress) + properties[i]['old'][2]);
						obj.style[properties[i]['name']] = rgb2hex(r, g, b);
					}else if(/scrollLeft|scrollTop/.test(properties[i]['name'])){
						obj[properties[i]['name']] = val;
					}else if(properties[i]['name'] == 'docScrollTop'){
						document.documentElement.scrollTop = val;
						document.body.scrollTop = val;
					}else{
						obj.style[properties[i]['name']] = parseInt(val) + properties[i]['dimension'];
					}
				}
				return false;
			}
			for(var i = 0, ln = properties.length; i < ln; i++){
				if(properties[i]['name'] == 'opacity')
					setOpacity(obj, properties[i]['new']);
				else if(/color/i.test(properties[i]['name']))
					obj.style[properties[i]['name']] = rgb2hex(properties[i]['new'][0], properties[i]['new'][1], properties[i]['new'][2]);
				else if(/scrollLeft|scrollTop/.test(properties[i]['name']))
					obj[properties[i]['name']] = properties[i]['new'];
				else if(properties[i]['name'] == 'docScrollTop'){
					document.documentElement.scrollTop = properties[i]['new'];
					document.body.scrollTop = properties[i]['new'];
				}else
					obj.style[properties[i]['name']] = properties[i]['new'] + properties[i]['dimension'];
			}
			return true;
		}
		var prepareEndPosition = function(name, value){
			if(name.match(/color/i)){
				if(/rgb/i.test(value)){
					var rgb = value.match(/\d+/g);
					return [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
				}else{
					return hex2rgb(value.match(/[\w\d]+/)[0]);
					
				}
			}
			return value.replace(/[^\-0-9\.]/g,'');
		}
		var getDimension = function(value){
			var pure = value.match(/\d+(\D*)/);
			return pure? pure[1] : '';
		}
		var getStyle = function(name, dimension){
			switch(name){
				case 'width':
				case 'height':
				case 'top':
				case 'left':
					var Name = name.charAt(0).toUpperCase() + name.substr(1, name.length-1);
					if(dimension == '%' && !obj.style[name].match(/%/)){
						var el = (/body/i.test(obj.parentNode.tagName) || /top|left/i.test(Name))? 'client' : 'offset';
						var pv = (/width|left/i.test(Name))? obj.parentNode[el + 'Width'] : obj.parentNode[el + 'Height'];
						return 100 * ( obj['offset' + Name] / pv );
					}
					else if((dimension == '%' && /%/.test(obj.style[name]))
							|| (dimension == 'px' && /px/.test(obj.style[name]))){
						return parseInt(obj.style[name]);
					}
					return obj['offset' + Name];
				break;
				case 'opacity':
					if(IE6 || IE7 || IE8){
						var reg = /alpha\(opacity=(.*)\)/;
						var res = reg.exec(obj.style.filter||getCSSStyle(obj, 'filter'));
						return (res)? res[1] / 100 : 1;
					}
					else{
						var val = parseFloat(obj.style.opacity||getCSSStyle(obj, 'opacity'));
						return (!isNaN(val))? val : 1;
					}
				break;
				case 'color':
				case 'backgroundColor':
				case 'borderColor':
					var val = getCSSStyle(obj, name);
					if(val.match(/rgb/i))
						return val = val.match(/\d+/g), [parseInt(val[0]), parseInt(val[1]), parseInt(val[2])];	
					return hex2rgb(val.match(/[\w\d]+/)[0]);	
				break;
				case 'docScrollTop':
					return getBodyScrollTop() || 0;
				break;
				case 'scrollLeft':
				case 'scrollTop':
					return o[name];
				break;
				default:
					return getCSSStyle(obj, name, true) || 0;
			}
		}
	}
	var getCSSStyle = this.getCSSStyle = function(o, name, number){
			var obj = typeof o.currentStyle != 'undefined'? o.currentStyle : document.defaultView.getComputedStyle(o, null); 
			return number? 
				parseFloat(obj[name].toString().replace(/(pt|px|%)/g,'')) :
				obj[name];
	}
	var hex2rgb = this.hex2rgb = function(hex){
		return(function(v){return [v >> 16 & 255, v >> 8 & 255, v & 255];})(parseInt(hex, 16));
	}
	var rgb2hex = this.rgb2hex = function (r, g , b){
		var rgb= new Array(r, g, b);
		for(i in rgb){
			rgb[i]=Number(rgb[i]).toString(16);	
			if(rgb[i] == '0')
				rgb[i] = '00';
			else if(rgb[i].length == 1)
				rgb[i] = '0' + rgb[i];
		}
		return '#'+rgb.join('');
	}
	/******************************** Cookie ********************************/
	// Does not work, yet
	this.Cookie = new function(){
		var me = this;
		me.get = function(name){
		    var regexp  = new RegExp('(?:; )?' + name + '=([^;]*);?');
		    if (regexp.test(document.cookie))
		    	return decodeURIComponent(regexp['$1']);
		    return null;
		}
		me.set = function(name, value, props){
			props = merge({
				'expires' : (d = new Date(), d.setTime(d.getTime()*1000), d.toGMTString())
			}, props);
		    value = encodeURIComponent(value)
		    var updatedCookie = name + "=" + value
		    for(var propName in props){
		        updatedCookie += "; " + propName;
		        if(props[propName] !== true){ updatedCookie += "=" + props[propName] }
		    }
		    document.cookie = updatedCookie
		    return true;
		};
		me['delete'] = function(name){
			return me.set(name, null, { expires: -1 })
		}
	}
}