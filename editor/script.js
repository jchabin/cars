var walls = [];
var start = [];
var trees = [];
var arrows = [];
var erase = [];
var hist = [];

var mouse = {
	down: false,
	start: {
		x: 0,
		y: 0
	},
	cur: {
		x: 0,
		y: 0
	},
	end: {
		x: 0,
		y: 0
	}
}
var sel = 0;
var s = document.getElementById("menu");
var ca = document.getElementById("c");
var height = ca.clientHeight * window.devicePixelRatio;
var width = ca.clientWidth * window.devicePixelRatio;
ca.height = height;
ca.width = width;
var scale = 10;
var offset = {x: width % scale / 2, y : height % scale / 2}
var c = ca.getContext("2d");
c.lineCap = "round";
c.lineWidth = 2;
function drawBG(){
	c.clearRect(0, 0, width, height);
	c.strokeStyle="#C0C0C0";
	c.beginPath();
	for(var x = offset.x - scale; x < width; x += scale){
		c.moveTo(x, 0);
		c.lineTo(x, height);
	}
	for(var y = offset.y - scale; y < height; y += scale){
		c.moveTo(0, y);
		c.lineTo(width, y);
	}
	c.stroke();
}
drawBG();

function update(){
	requestAnimationFrame(update);
	height = ca.clientHeight * window.devicePixelRatio;
	width = ca.clientWidth * window.devicePixelRatio;
	ca.height = height;
	ca.width = width;
	drawBG();
	c.fillStyle="#08cc3c";
	c.beginPath();
	c.moveTo(width / 2, height / 2 - 10 - scale / 2);
	c.lineTo(width / 2 - 5, height / 2 + 5 - scale / 2);
	c.lineTo(width / 2 + 5, height / 2 + 5 - scale / 2);
	c.fill();
	c.translate(offset.x, offset.y);
	c.lineCap = "round";
	c.lineWidth = 2;
	c.strokeStyle="#f48342";
	c.beginPath();
	for(var i = 0; i < walls.length; i++){
		c.moveTo(scale * walls[i].start.x, scale * walls[i].start.y);
		c.lineTo(scale * walls[i].end.x, scale * walls[i].end.y);
	}
	c.stroke();
	c.strokeStyle="#428ff4";
	c.beginPath();
	for(var i = 0; i < start.length && i < 1; i++){
		c.moveTo(scale * start[i].start.x, scale * start[i].start.y);
		c.lineTo(scale * start[i].end.x, scale * start[i].end.y);
	}
	c.stroke();
	c.strokeStyle="#f00";
	c.beginPath();
	for(var i = 1; i < start.length; i++){
		c.moveTo(scale * start[i].start.x, scale * start[i].start.y);
		c.lineTo(scale * start[i].end.x, scale * start[i].end.y);
	}
	c.stroke();
	c.fillStyle="#08cc3c";
	for(var i = 0; i < trees.length; i++){
		c.beginPath();
		c.arc(scale * trees[i].x, scale * trees[i].y, 5, 0, 2 * Math.PI);
		c.fill();
	}
	c.fillStyle="#f00";
	c.beginPath();
	for(var i = 0; i < arrows.length; i++){
		c.moveTo(scale * arrows[i].x, scale * arrows[i].y);
		c.lineTo(scale * arrows[i].x - scale * Math.cos(arrows[i].angle) / 2, scale * arrows[i].y - scale * Math.sin(arrows[i].angle) / 2);
	}
	c.stroke();
	c.translate(-offset.x, -offset.y);
}
update();

function select(n){
	sel = n;
	for(var i = 0; i < s.children.length - 1; i++)
		s.children[i].className = "button" + (i == n ? " selected" : "");
}

function gridX(x){
	return Math.round((x - offset.x) / scale);
}

function gridY(x){
	return Math.round((x - offset.y) / scale);
}

ca.onmousedown = function(e){
	mouse.down = true;
	mouse.cur.x = e.clientX;
	mouse.cur.y = e.clientY;
	mouse.start.x = e.clientX;
	mouse.start.y = e.clientY;
	if(sel == 0)
		walls.push({
			start: {
				x: gridX(mouse.start.x),
				y: gridY(mouse.start.y)
			},
			end: {
				x: gridX(mouse.start.x),
				y: gridY(mouse.start.y)
			}
		});
	if(sel == 1)
		start.push({
			start: {
				x: gridX(mouse.start.x),
				y: gridY(mouse.start.y)
			},
			end: {
				x: gridX(mouse.start.x),
				y: gridY(mouse.start.y)
			}
		});
	if(sel == 2)
		trees.push({
			x: gridX(mouse.start.x),
			y: gridY(mouse.start.y)
		});
	if(sel == 3)
		arrows.push({
			x: gridX(mouse.start.x),
			y: gridY(mouse.start.y),
			angle: 0
		});
	if(sel == 4)
		eraseL(gridX(mouse.cur.x), gridY(mouse.cur.y));
}

ca.onmousemove = function(e){
	mouse.cur.x = e.clientX;
	mouse.cur.y = e.clientY;
	if(sel == 0 && mouse.down){
		walls[walls.length - 1].end.x = gridX(mouse.cur.x);
		walls[walls.length - 1].end.y = gridY(mouse.cur.y);
	}
	if(sel == 1 && mouse.down){
		start[start.length - 1].end.x = gridX(mouse.cur.x);
		start[start.length - 1].end.y = gridY(mouse.cur.y);
	}
	if(sel == 2 && mouse.down){
		trees.push({
			x: gridX(mouse.cur.x),
			y: gridY(mouse.cur.y)
		});
		hist.push(sel);
	}
	if(sel == 3 && mouse.down)
		arrows[arrows.length - 1].angle = Math.atan2(mouse.start.y - mouse.cur.y, mouse.start.x - mouse.cur.x);
	if(sel == 4 && mouse.down)
		eraseL(gridX(mouse.cur.x), gridY(mouse.cur.y));
}

ca.onmouseup = function(e){
	mouse.down = false;
	mouse.cur.x = e.clientX;
	mouse.cur.y = e.clientY;
	mouse.end.x = e.clientX;
	mouse.end.y = e.clientY;
	if(sel == 0){
		walls[walls.length - 1].end.x = gridX(mouse.end.x);
		walls[walls.length - 1].end.y = gridY(mouse.end.y);
	}
	if(sel == 1){
		start[start.length - 1].end.x = gridX(mouse.end.x);
		start[start.length - 1].end.y = gridY(mouse.end.y);
	}
	if(sel == 2)
		trees[trees.length - 1] = {
			x: gridX(mouse.end.x),
			
			y: gridY(mouse.end.y)
		};
	hist.push(sel);
	//console.log(hist);
}

function exp(){
	var text = "";
	for(var i = 0; i < walls.length; i++){
		text += walls[i].start.x - Math.floor(width / scale / 2) + ",";
		text += -1 * (walls[i].start.y - Math.floor(height / scale / 2)) + "/";
		text += walls[i].end.x - Math.floor(width / scale / 2) + ",";
		text += -1 * (walls[i].end.y - Math.floor(height / scale / 2)) + " ";
	}
	text += "|";
	for(var i = 0; i < start.length; i++){
		text += start[i].start.x - Math.floor(width / scale / 2) + ",";
		text += -1 * (start[i].start.y - Math.floor(height / scale / 2)) + "/";
		text += start[i].end.x - Math.floor(width / scale / 2) + ",";
		text += -1 * (start[i].end.y - Math.floor(height / scale / 2)) + " ";
	}
	text += "|";
	for(var i = 0; i < trees.length; i++){
		text += trees[i].x - Math.floor(width / scale / 2) + ",";
		text += -1 * (trees[i].y - Math.floor(height / scale / 2)) + " ";
	}
	text += "|";
	for(var i = 0; i < arrows.length; i++){
		text += arrows[i].x - Math.floor(width / scale / 2) + ",3,";
		text += -1 * (arrows[i].y - Math.floor(height / scale / 2)) + "/";
		text += Math.floor(90 - arrows[i].angle * 180 / Math.PI) + " ";
	}
	text += "|";
	text += "<br/>";
	var win = window.open();
	win.document.body.innerHTML = text;
}

document.body.onkeydown = function(e){
	if(e.keyCode == 90 && (e.ctrlKey || e.metaKey)){
		//console.log(hist);
		e.preventDefault();
		var a = hist.splice(hist.length - 1, 1)[0];
		var ar = [walls, start, trees, arrows, erase][a];
		var del = ar.splice(ar.length - 1, 1)[0];
		if(ar == erase){
			del.list.splice(del.pos, 0, del.ob);
		}
	}
}
function eraseL(x, y){
	for(var i = 0; i < walls.length; i++)
		if(Math.hypot(walls[i].start.x - x, walls[i].start.y - y) < 1 || Math.hypot(walls[i].end.x - x, walls[i].end.y - y) < 1){
			hist.push(sel);
			erase.push({
				list: walls,
				ob: walls.splice(i, 1)[0],
				pos: i
			});
		}
	for(var i = 0; i < start.length; i++)
		if(Math.hypot(start[i].start.x - x, start[i].start.y - y) < 1 || Math.hypot(start[i].end.x - x, start[i].end.y - y) < 1){
			hist.push(sel);
			erase.push({
				list: start,
				ob: start.splice(i, 1)[0],
				pos: i
			});
		}
	for(var i = 0; i < trees.length; i++)
		if(Math.hypot(trees[i].x - x, trees[i].y - y) < 1){
			hist.push(sel);
			erase.push({
				list: trees,
				ob: trees.splice(i, 1)[0],
				pos: i
			});
		}
	for(var i = 0; i < arrows.length; i++)
		if(Math.hypot(arrows[i].x - x, arrows[i].y - y) < 1){
			hist.push(sel);
			erase.push({
				list: arrows,
				ob: arrows.splice(i, 1)[0],
				pos: i
			});
		}
}
function help(){
	document.getElementById("help").parentElement.style.transform = "none";
}
