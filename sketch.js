var grid;
var car1, car2;
var ratio = 15;
var DEPTH = 3;
var maxVelocity = 6;
var angleInterval = 45;
var track;
var race;

function setup() {
	track = [];
	race = false;
	
	createCanvas(floor(900/ratio) * ratio, floor(600/ratio) * ratio);
	grid = new Grid(ratio);
	
	var me = color(255, 200);
	var ai = color(155, 200);
	car1 = new Vehicle(1, 2, me);
	car2 = new Vehicle(1, 3, ai);
	
	frameRate(10);
	angleMode(DEGREES);
}

function mousePressed(){
	if( ! race || car1.winner || car2.winner) return false;
	noLoop();
	var mx = round(mouseX / ratio) * ratio;
	var my = round(mouseY / ratio) * ratio;
	for(var i = 0; i < car1.allMoves.length; i++){
		if(car1.allMoves[i].pos.x == mx && car1.allMoves[i].pos.y == my){
			car1.drive(car1.allMoves[i].dir, car1.allMoves[i].vel);
			draw();
			if(car1.winner){
				console.log("Zmaga je tvoja!");
			}else{
				car2.AIgo(DEPTH);
				draw();
				if(car2.winner){
					console.log("Premagal te je računalnik!");
				}
			}
			return;
		}
	}
}

function mouseDragged(){
	if(race) return false;
	track.push(createVector(mouseX, mouseY));
	return false;
}

function mouseReleased(){
	race = true;
}

function draw() {
	background(0, 211, 120);
	grid.show();
	
	//draw track
	beginShape();
	noFill();
	stroke(0);
	strokeWeight(ratio * 4);
	vertex(ratio * 2, ratio * 2);
	for(var i = 0; i < track.length; i++){
		if(i % ratio === 0) vertex(track[i].x, track[i].y);
	}
	vertex(width - ratio * 2, height - ratio * 2);
	endShape();
	//
	
	noStroke();
	fill(255,100);
	ellipse(width - ratio * 2, height - ratio * 2, ratio * 5, ratio * 5);
	
	if( ! race) return false;
	
	car1.moves(car1.position, car1.angle, car1.speed);
	//car2.moves(car2.position, car2.angle, car2.speed);
	car1.show(true);
	car2.show(false);
}