var SPEED = 0.004;
var CAMERA_LAG = 0.9;
var COLLISION = 1.5;
var BOUNCE = 0.9;
const MAP_SCALE = 5;
var shiny = false;

setTimeout(function(){
	document.getElementById("title").style.transform = "none";
}, 500);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[0].style.transform = "none";
}, 1000);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[1].style.transform = "none";
}, 1200);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[2].style.transform = "none";
}, 1400);

var config = {
	apiKey: "AIzaSyDiJsMLlix5o9XqPW1EpeBvuA15XNjlR8M",
	authDomain: "car-game-a86b9.firebaseapp.com",
	databaseURL: "https://car-game-a86b9.firebaseio.com",
	projectId: "car-game-a86b9",
	storageBucket: "car-game-a86b9.appspot.com",
	messagingSenderId: "722396856191"
};
firebase.initializeApp(config);

var database = firebase.database();

var camera, renderer, scene, renderer2, scene2, labels = []; 
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
var element = renderer.domElement;
var shinymat;

var mobile = navigator.userAgent.match("Mobile")!=null||navigator.userAgent.match("Linux;")!=null;

window.ontouchstart = function(e){
	e.preventDefault();
}
window.ontouchmove = function(e){
	e.preventDefault();
}
window.ontouchend = function(e){
	e.preventDefault();
}
// window.onclick = function(e){
// 	toggleFullScreen();
// }
function toggleFullScreen() {
	var doc = window.document;
	var docEl = doc.documentElement;

	var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
	var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

	if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl);
	}
	else {
		cancelFullScreen.call(doc);
	}
	window.scrollTo(0,1);
}

var name, code, players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;
var carPos = [
	{x: 0, y: 0},
	{x: 2, y: 0},
	{x: -2, y: 0},
	{x: 0, y: -3},
	{x: -2, y: -3},
	{x: 2, y: -3},
	{x: 0, y: -6},
	{x: 2, y: -6},
	{x: -2, y: -6}
];
color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");
updateColor = function(){
	s.style.marginLeft = color / 360 * 80 + "vw";
	s.style.backgroundColor = "hsl(" + color + ", 100%, 50%)";
	document.body.style.backgroundColor = "hsl(" + color + ", 50%, 50%)";
}
updateColor();

menu2 = function(){
	if(document.getElementById("name").value == "")
		name = "Nerd with No Name";
	else
		name = document.getElementById("name").value;
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='menuitem title button' id='host' ontouchstart='this.click()' onclick='host()'>Host a game</div><div class='menuitem title button' ontouchstart='this.click()' id='join' onclick='joinGame()'>Join a game</div>";
		f.style.transform = "none";
		setTimeout(function(){
			document.getElementById("host").style.transform = "none";
			setTimeout(function(){
				document.getElementById("host").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 500);
		setTimeout(function(){
			document.getElementById("join").style.transform = "none";
			setTimeout(function(){
				document.getElementById("join").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 1000);
	}, 500);
}

host = function(){
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='info title'>Use this code to join the game!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()' ontouchstart='this.click()'>Start!</div>";
		f.appendChild(element);
		f.style.transform = "none";
		getCode();
	}, 1000);
	
	function getCode(){
		code = "";
		var letters = "ABCDEFGHIJKLMMNOPQRSTUVWXYZ";
		for(var i = 0; i < 4; i++)
			code += letters[Math.floor(Math.random() * letters.length)];
		database.ref(code).once("value", function(codeCheck){
			console.log(codeCheck.val());
			if(codeCheck.val() == null || codeCheck.val().status == -1){
				console.log(code);
				document.getElementById("code").innerHTML = code;
				
				database.ref(code).set({
					status: 0,
					players: {}
				});
				
				database.ref(code + "/players").on("child_added", function(p){
					console.log(p);
					players[p.ge.path.n[2]] = {
						data: p.val(),
						model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
					};
					var pl = players[p.ge.path.n[2]];
					pl.model.position.set(pl.data.x, 0.6, pl.data.y);
					pl.model.material = shiny ? shinymat : new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
					var wheel = new THREE.Mesh(
						new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
						shiny ? shinymat : new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
					);
					var w1 = wheel.clone();
					w1.position.set(0.6, -0.1, 0.7);
					w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w1);
					var w2 = wheel.clone();
					w2.position.set(-0.6, -0.1, 0.7);
					w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w2);
					var w3 = wheel.clone();
					w3.position.set(0.6, -0.1, -0.7);
					w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w3);
					var w4 = wheel.clone();
					w4.position.set(-0.6, -0.1, -0.7);
					w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w4);
					var label = document.createElement("DIV");
					label.className = "label";
					label.innerHTML = pl.data.name + "<br/>|";
					pl.label = label;
					label.position = pl.model.position;
					console.log(label);
					f.appendChild(label);
					labels.push(label);
					scene.add(pl.model);
					
					if(p.ge.path.n[2] == me.ref.path.n[2]){
						me.label = pl.label;
						me.model = pl.model;
						me.label.innerHTML = "";
					}
				});
				
				database.ref(code + "/players").on("child_changed", function(p){
					// console.log(p);
					players[p.ge.path.n[2]].data = p.val();
				});
				
				me.ref = database.ref(code + "/players").push();
				me.data = {
					x: 0,
					y: 0,
					xv: 0,
					yv: 0,
					dir: 0,
					steer: 0,
					color: color,
					name: name,
					checkpoint: 1,
					lap: 0,
					collision: {}
				}
				me.ref.set(me.data);
				
				database.ref(code + "/status").on("value", function(v){
					v = v.val();
					if(v == 1){
						document.getElementsByClassName("info")[0].outerHTML = "";
						document.getElementById("startgame").outerHTML = "";
						
						gameStarted = true;
						gameSortaStarted = true;
						
						var countDown = document.createElement("DIV");
						countDown.innerHTML = "3";
						countDown.className = "title";
						countDown.id = "countdown";
						f.appendChild(countDown);
						
						lap = document.createElement("DIV");
						lap.innerHTML = "1/3";
						lap.className = "title";
						lap.id = "lap";
						f.appendChild(lap);
						
						setTimeout(function(){
							countDown.innerHTML = "2";
						}, 1000);
						
						setTimeout(function(){
							countDown.innerHTML = "1";
						}, 2000);
						
						setTimeout(function(){
							countDown.innerHTML = "GO!";
							gameSortaStarted = false;
						}, 3000);
						
						setTimeout(function(){
							countDown.innerHTML = "";
						}, 4000);
					}
				});
			}else
				getCode();
		});
	}
	
	join();
}

joinGame = function(){
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='info title'>Enter a code to join a game!<input id='incode' class='title' onkeyup='codeCheck(event)' ontouchstart='this.focus()'></input></div>";
		f.appendChild(element);
		f.style.transform = "none";
	}, 1000);
	join();
}

function join(){
	var cubeCamera = new THREE.CubeCamera(1, 100, 128);
	scene.add(cubeCamera);
	
	shinymat = new THREE.MeshBasicMaterial({envMap: cubeCamera.renderTarget});
	
	var racedata = document.getElementById("trackcode").innerHTML.trim().split(" ");
	var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342), side: THREE.DoubleSide});
	var mapscale = 7;
	var map = new THREE.Object3D();
	for(var i = 0; i < racedata.length; i++){
		var point1 = new THREE.Vector2(parseInt(racedata[i].split("/")[0].split(",")[0]), parseInt(racedata[i].split("/")[0].split(",")[1]));
		var point2 = new THREE.Vector2(parseInt(racedata[i].split("/")[1].split(",")[0]), parseInt(racedata[i].split("/")[1].split(",")[1]));
		var wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 1.5, 0.3),
			material
		);
		var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
		wall.rotation.set(0, angle, 0, "YXZ");
		var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		wall.plane = plane;
		wall.width = point1.distanceTo(point2) * mapscale;
		map.add(wall);
	}
	scene.add(map);
	
	var trees = new THREE.Object3D();
	var tree = new THREE.Mesh(
		new THREE.CylinderBufferGeometry(0, 4, 15),
		new THREE.MeshLambertMaterial({color: new THREE.Color("#1bad2c")})
	);
	var treedata = document.getElementById("trees").innerHTML.trim().split(" ");
	for(var i = 0; i < treedata.length; i++){
		var t = tree.clone();
		t.position.set(-parseInt(treedata[i].split(",")[0]) * mapscale, 0, parseInt(treedata[i].split(",")[1]) * mapscale);
		var s = Math.random() + 1;
		t.scale.set(s, s, s);
		trees.add(t);
	}
	scene.add(trees);
	
	var startdata = document.getElementById("startdata").innerHTML.trim().split(" ");
	var startc = new THREE.Object3D();
	for(var i = 0; i < startdata.length; i++){
		var point1 = new THREE.Vector2(parseInt(startdata[i].split("/")[0].split(",")[0]), parseInt(startdata[i].split("/")[0].split(",")[1]));
		var point2 = new THREE.Vector2(parseInt(startdata[i].split("/")[1].split(",")[0]), parseInt(startdata[i].split("/")[1].split(",")[1]));
		var wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 0.1, 1),
			new THREE.MeshLambertMaterial({color: new THREE.Color(i == 0 ? "#2580db" : "#db2525"), side: THREE.DoubleSide})
		);
		var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0, (point1.y + point2.y) / 2 * mapscale);
		wall.rotation.set(0, angle, 0, "YXZ");
		var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		wall.plane = plane;
		wall.width = point1.distanceTo(point2) * mapscale;
		startc.add(wall);
	}
	scene.add(startc);
	
	scene.background = new THREE.Color(0x7fb0ff);
	
	camera = new THREE.PerspectiveCamera(
		90,
		window.innerWidth / window.innerHeight,
		0.01,
		1000
	);
	
	camera.position.set(0, 3, 10);
	scene.add(camera);
	
	var player = new THREE.Object3D();
	player.position.set(0, 0, 0);
	
	camera.lookAt(player.position);
	
	scene.add(player);
	
	var ground = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1000, 1000),
		new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115), side: THREE.DoubleSide})
	);
	ground.rotation.set(-Math.PI / 2, 0, 0);
	scene.add(ground);
	
	for(var i = 0; i < 100; i++){
		var cube = new THREE.Mesh(
			new THREE.BoxBufferGeometry(100, 100, 100),
			new THREE.MeshLambertMaterial({color: new THREE.Color("#888"), side: THREE.DoubleSide})
		);
		var dist = Math.random() * 250 + 250;
		var dir = Math.random() * Math.PI * 2;
		cube.position.set(dist * Math.sin(dir), 0, dist * Math.cos(dir));
		cube.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
		scene.add(cube);
	}
	
	var light = new THREE.DirectionalLight();
	light.position.set(1000, 3000, -2000);
	scene.add(light);
	
	scene.add(new THREE.AmbientLight(0x404040));
	
	var x = 0;
	var ray = new THREE.Raycaster();
	function toXYCoords(pos){
		pos = pos.clone();
		pos.y += 0.5;
		var vector = pos.project(camera);
		vector.x = (vector.x + 1) / 2 * window.innerWidth;
		vector.y = -(vector.y - 1) / 2 * window.innerHeight;
		return vector;
	}
	var windowsize = {x: window.innerWidth, y: window.innerHeight};
	
	var ray = new THREE.Raycaster();
	ray.near = 0;
	ray.far = 1;
	
	var lastTime = performance.now();
	function render(timestamp) {
		requestAnimationFrame(render);
		var timepassed = timestamp - lastTime;
		lastTime = timestamp;
		var warp = timepassed / 16;
		
		if(gameStarted){
			if(!mobile){
				if(left)
					me.data.steer = Math.PI / 6;
				if(right)
					me.data.steer = -Math.PI / 6;
				if(!(left ^ right))
					me.data.steer = 0;
			}
			
			players[me.ref.path.n[2]].data = me.data;
			
			if(!gameSortaStarted){
				for(var p in players){
					var play = players[p];
					
					play.data.dir += play.data.steer / 10 * warp;
					
					play.data.xv += Math.sin(play.data.dir) * SPEED * warp;
					play.data.yv += Math.cos(play.data.dir) * SPEED * warp;
					
					play.data.xv *= Math.pow(0.99, warp);
					play.data.yv *= Math.pow(0.99, warp);
					
					play.data.x += play.data.xv * warp;
					play.data.y += play.data.yv * warp;
					
					play.model.position.x = play.data.x + play.data.xv;
					play.model.position.z = play.data.y + play.data.yv;
					play.model.rotation.y = play.data.dir;
					
					play.model.children[0].rotation.z = Math.PI / 2 - play.data.steer;
					play.model.children[1].rotation.z = Math.PI / 2 - play.data.steer;
					
					// function checkCubes(angle){
					// 	ray.set(play.model.position, angle);
					// 	var inter = ray.intersectObjects(blocks);
					// 	if(inter.length > 0 && inter[0].distance < 0.5){
					// 		// console.log(inter[0]);
					// 		var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
					// 		vel.reflect(inter[0].face.normal);
					// 		play.data.xv = vel.x * 0.3;
					// 		play.data.yv = vel.z * 0.3;
					// 		play.data.x += play.data.xv;
					// 		play.data.y += play.data.yv;
					// 	}
					// }
					// checkCubes(new THREE.Vector3(0, 0, 1));
					// checkCubes(new THREE.Vector3(0, 0, -1));
					// checkCubes(new THREE.Vector3(1, 0, 0));
					// checkCubes(new THREE.Vector3(-1, 0, 0));
					
					for(var w in map.children){
						var wall = map.children[w];
						// console.log(wall.plane.distanceToPoint(play.model.position.clone().sub(wall.position)));
						if(Math.abs(wall.plane.distanceToPoint(play.model.position.clone().sub(wall.position))) < 1){
							if(wall.position.clone().distanceTo(play.model.position) < wall.width / 2 + 1){
								var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
								vel.reflect(wall.plane.normal);
								play.data.xv = vel.x;
								play.data.yv = vel.z;
								while(Math.abs(wall.plane.distanceToPoint(new THREE.Vector3(play.data.x, 0, play.data.y).sub(wall.position))) < 1){
									play.data.x += play.data.xv;
									play.data.y += play.data.yv;
								}
								play.data.xv *= BOUNCE;
								play.data.yv *= BOUNCE;
							}
						}
					}
					
					for(var i in startc.children){
						var cp = startc.children[i];
						if(Math.abs(cp.plane.distanceToPoint(play.model.position.clone().sub(cp.position))) < 1){
							if(cp.position.clone().distanceTo(play.model.position) < cp.width / 2 + 1){
								// console.log(i);
								if(i == 0){
									if(play.data.checkpoint == 1){
										play.data.checkpoint = 0;
										play.data.lap++;
									}
								}else
									play.data.checkpoint = 1;
							}
						}
					}
					
					if(play.data.lap > 3){
						document.getElementById("countdown").style.fontSize = "25vmin";
						document.getElementById("countdown").innerHTML = play.data.name + " Won!";
					}
					
					for(var pl in players){
						if(play != players[pl] && play.model.position.distanceTo(players[pl].model.position) < 1){
							var temp = new THREE.Vector2();
							temp.x = COLLISION * (players[pl].data.xv - play.data.xv);
							temp.y = COLLISION * (players[pl].data.yv - play.data.yv);
							players[pl].data.xv += COLLISION * (play.data.xv - players[pl].data.xv);
							players[pl].data.yv += COLLISION * (play.data.yv - players[pl].data.yv);
							play.data.xv += temp.x;
							play.data.yv += temp.y;
							play.data.x += play.data.xv;
							play.data.y += play.data.yv;
							players[pl].data.y += play.data.xv;
							players[pl].data.y += play.data.yv;
						}
					}
					
					if(play.model.position.distanceTo(new THREE.Vector3()) > 150){
						play.data.x = 0;
						play.data.y = 0;
					}
				}
			}
			
			var target = new THREE.Vector3(
				me.model.position.x + Math.sin(-me.model.rotation.y) * 5,
				2,
				me.model.position.z + -Math.cos(-me.model.rotation.y) * 5
			);
			camera.position.set(
				camera.position.x * Math.pow(CAMERA_LAG, warp) + target.x * (1 - Math.pow(CAMERA_LAG, warp)),
				2,
				camera.position.z * Math.pow(CAMERA_LAG, warp) + target.z * (1 - Math.pow(CAMERA_LAG, warp))
			);
			camera.lookAt(me.model.position);
			
			me.ref.set(me.data);
			
			lap.innerHTML = me.data.lap <= 3 ? me.data.lap + "/3" : "";
		}else{
			camera.position.set(10 * Math.sin(x), 3, 10 * Math.cos(x));
			camera.lookAt(player.position);
		}
		
		x += 0.01;
		
		camera.updateMatrix();
		camera.updateMatrixWorld();
		camera.updateProjectionMatrix();
		var frustum = new THREE.Frustum();
		frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		for(var i = 0; i < labels.length; i++){
			var label = labels[i];
			if(frustum.containsPoint(label.position)){
				var vec = toXYCoords(label.position);
				label.style.left = vec.x + "px";
				label.style.top = vec.y + "px";
				label.style.zIndex = 99999 - Math.floor(camera.position.distanceTo(label.position) * 10);
				label.style.display = "inline-block";
			}else
				label.style.display = "none";
		}
		
		if(windowsize.x != window.innerWidth || windowsize.x != window.innerHeight){
			windowsize = {x: window.innerWidth, y: window.innerHeight};
			onWindowResize();
		}
		
		if(shiny){
			me.model.material = shinymat;
			me.model.visible = false;
			cubeCamera.updateCubeMap(renderer, scene);
			cubeCamera.position.copy(me.model.position);
			me.model.visible = true;x
		}
		
		renderer.render(scene, camera);
	}
	
	render(performance.now());
	
	window.addEventListener("resize", onWindowResize, false);
	window.addEventListener("orientationchange", onWindowResize, false);

	function onWindowResize(){
		function orientCamera(){
			camera.aspect = window.innerWidth / window.innerHeight;
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		orientCamera();
		setTimeout(orientCamera, 0);
	}
}
codeCheck = function(){
	var incode = document.getElementById("incode");
	if(incode.value.length == 4){
		incode.onkeyup = null;
		code = incode.value.toUpperCase();
		database.ref(code).once("value", function(cc){
			if(typeof cc.val() != "undefined" && cc.val() != null && cc.val().status === 0){
				document.getElementsByClassName("info")[0].innerHTML = "<div class='info title'>Waiting for the game to start...<div id='code'>" + code + "</div></div>";
				var playerCount = 0;
				for(var p in cc.val().players){
					playerCount++;
					console.log(p);
					players[p] = {
						data: cc.val().players[p],
						model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
					};
					var pl = players[p];
					pl.model.position.set(pl.data.x, 0.6, pl.data.y);
					pl.model.material = shiny ? shinymat : new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
					var wheel = new THREE.Mesh(
						new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
						shiny ? shinymat : new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
					);
					var w1 = wheel.clone();
					w1.position.set(0.6, -0.1, 0.7);
					w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w1);
					var w2 = wheel.clone();
					w2.position.set(-0.6, -0.1, 0.7);
					w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w2);
					var w3 = wheel.clone();
					w3.position.set(0.6, -0.1, -0.7);
					w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w3);
					var w4 = wheel.clone();
					w4.position.set(-0.6, -0.1, -0.7);
					w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w4);
					var label = document.createElement("DIV");
					label.className = "label";
					label.innerHTML = pl.data.name + "<br/>|";
					pl.label = label;
					label.position = pl.model.position;
					console.log(label);
					f.appendChild(label);
					labels.push(label);
					scene.add(pl.model);
				}
				database.ref(code + "/players").on("child_added", function(p){
					if(typeof players[p.ge.path.n[2]] == "undefined"){
						console.log(p);
						players[p.ge.path.n[2]] = {
							data: p.val(),
							model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
						};
						var pl = players[p.ge.path.n[2]];
						pl.model.position.set(pl.data.x, 0.6, pl.data.y);
						pl.model.material = shiny ? shinymat : new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
						var wheel = new THREE.Mesh(
							new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
							shiny ? shinymat : new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
						);
						var w1 = wheel.clone();
						w1.position.set(0.6, -0.1, 0.7);
						w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w1);
						var w2 = wheel.clone();
						w2.position.set(-0.6, -0.1, 0.7);
						w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w2);
						var w3 = wheel.clone();
						w3.position.set(0.6, -0.1, -0.7);
						w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w3);
						var w4 = wheel.clone();
						w4.position.set(-0.6, -0.1, -0.7);
						w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w4);
						var label = document.createElement("DIV");
						label.className = "label";
						label.innerHTML = pl.data.name + "<br/>|";
						pl.label = label;
						label.position = pl.model.position;
						console.log(label);
						f.appendChild(label);
						labels.push(label);
						scene.add(pl.model);
						
						if(p.ge.path.n[2] == me.ref.path.n[2]){
							me.label = pl.label;
							me.model = pl.model;
							me.label.innerHTML = "";
						}
					}
				});
				
				database.ref(code + "/players").on("child_changed", function(p){
					// console.log(p);
					players[p.ge.path.n[2]].data = p.val();
				});
				console.log("playerCount: " + playerCount);
				me.ref = database.ref(code + "/players").push();
				me.data = {
					x: carPos[playerCount].x,
					y: carPos[playerCount].y,
					xv: 0,
					yv: 0,
					dir: 0,
					steer: 0,
					color: color,
					name: name,
					checkpoint: 1,
					lap: 0,
					collision: {}
				}
				me.ref.set(me.data);
				
				database.ref(code + "/status").on("value", function(v){
					v = v.val();
					if(v == 1){
						document.getElementsByClassName("info")[0].outerHTML = "";
						
						gameStarted = true;
						gameSortaStarted = true;
						
						var countDown = document.createElement("DIV");
						countDown.innerHTML = "3";
						countDown.className = "title";
						countDown.id = "countdown";
						f.appendChild(countDown);
						
						setTimeout(function(){
							countDown.innerHTML = "2";
						}, 1000);
						
						setTimeout(function(){
							countDown.innerHTML = "1";
						}, 2000);
						
						setTimeout(function(){
							countDown.innerHTML = "GO!";
							gameSortaStarted = false;
						}, 3000);
						
						setTimeout(function(){
							countDown.innerHTML = "";
						}, 4000);
					}
				});
			}else
				incode.onkeyup = codeCheck;
		});
	}else{
		incode.onkeyup = codeCheck;
		if(incode.value.length > 4)
			incode.value = incode.value.substring(0, 4);
	}
}

function startGame(){
	database.ref(code + "/status").set(1);
}

window.onkeydown = function(e){
	if(e.keyCode == 37)
		left = true;
	if(e.keyCode == 39)
		right = true;
}

window.onkeyup = function(e){
	if(e.keyCode == 37)
		left = false;
	if(e.keyCode == 39)
		right = false;
}

if(mobile){
	window.ondeviceorientation = function(e){
		me.data.steer = Math.max(Math.min(e.beta / 180 * Math.PI, Math.PI / 6), -Math.PI / 6);
	}
}
