function Vehicle(x, y, col) {

	this.position = createVector(x * ratio, y * ratio);
	this.winner = false;
	this.path = [];

	this.path.push({pos:this.position.copy(), dir:0, vel:0});
	
	this.color = col;
	this.speed = 0;
	this.angle = 0;
	this.allMoves = [];
	
	this.moves = function(position, angle, speed){
		this.allMoves = this.getAllMoves(position, angle, speed);
	}
	
	this.adjustAngle = function(a){
		if(a >= 360) a = 0;
		if(a < 0) a = 360 + a;
		return a;
	}
	
	this.adjustSpeed = function(s){
		if(s < 0) s = 0;
		if(s > maxVelocity) s = maxVelocity;
		return s;
	}
	
	this.getPosition = function(a, v){
		var x = 0, y = 0;

		switch(a) {
			case 0:
				x += v;
				break;
			case angleInterval:
				x += v; y += v;
				break;
			case angleInterval * 2:
				y += v;
				break;
			case angleInterval * 3:
				x -= v; y += v;
				break;
			case angleInterval * 4:
				x -= v;
				break;
			case angleInterval * 5:
				x -= v; y -= v;
				break;
			case angleInterval * 6:
				y -= v;
				break;
			case angleInterval * 7:
				x += v; y -= v;
				break;
		}
		return createVector(x, y);
	}
	
	this.drive = function(dir, vel){
		var d = dir != 0 ? dir / Math.abs(dir) : 0; // d = -1, 0, 1
		var v = vel != 0 ? vel / Math.abs(vel) : 0; // v = -1, 0, 1
		this.angle = this.adjustAngle(this.angle + d * angleInterval);
		this.speed = this.adjustSpeed(this.speed + v);
		if(this.speed > 0){
			var pos1 = this.position.copy();
			this.position.add(
				this.getPosition(this.angle, this.speed * ratio)
			);
			var pos2 = this.position.copy();
			var Offroad = this.detectOffroad(pos2, pos1);
			if(Offroad){
				this.position.x = round(Offroad.x/ratio)*ratio;
				this.position.y = round(Offroad.y/ratio)*ratio;
				this.angle = floor(random(8)) * angleInterval;
				this.speed = 0;
			}
			if(this.detectWin(this.position)) this.winner = true;
			this.path.push({pos:this.position.copy(), dir:this.angle, vel:this.speed});
		}
	}
	
	this.detectOffroad = function(pos2, pos1){
		var vect = createVector(pos2.x - pos1.x, pos2.y - pos1.y);
		var length = vect.mag();
		var color;
		for(var n = 5; n < length; n++){
			vect.normalize();
			vect.mult(n);
			color = get(pos1.x + round(vect.x), pos1.y + round(vect.y));
			if(color[0] == color[1] && color[1] == color[2]){
				//on track!
			}else{
				return {'x':pos1.x + round(vect.x),'y':pos1.y + round(vect.y)};
			}
		}
		return false;
	}
	
	this.detectWin = function(pos){
		if(pos.x >= width - ratio * 4 && pos.y >= height - ratio * 4 && pos.x <= width - ratio && pos.y <= height - ratio){
			return true;
		}
		return false;
	}
	
	this.detectCollision = function(pos){
		var color = get(pos.x, pos.y);
		if(color[0] == 0 && color[1] == 0 && color[2] == 0){
			//on track
		}else{
			this.angle = floor(random(8)) * angleInterval;
			this.speed = 0;
		}
	}
	
	this.backup = function(){
		this.path.pop();
		var last = this.path[this.path.length - 1];
		this.position = last.pos.copy();
		this.angle = last.dir;
		this.speed = last.vel;
	}
	
	var bestChoice = null;
	
	this.AIgo = function(depth){
		this.findBestMove(this.position, this.angle, this.speed, depth);
		if(bestChoice) this.drive(bestChoice.dir, bestChoice.vel);
	}
	
	this.findBestMove = function(position, angle, speed, depth){
		var scores = [];
		var moves = [];
		var col, offroad, result;
		var max = 0;
		var bestJ = -1;
		
		if(this.detectWin(position)) return 10;
		
		if( ! depth ){
			return speed;
		}
		
		var possMoves = this.getAllMoves(position, angle, speed, 0);
		for(var i = 0; i < possMoves.length; i++){
			col = get(possMoves[i].pos.x, possMoves[i].pos.y);
			offroad = this.detectOffroad(possMoves[i].pos, position);
			if(col[0] == col[1] && col[1] == col[2] && ! offroad){
				scores.push(this.findBestMove(possMoves[i].pos, possMoves[i].angle, possMoves[i].speed, depth-1));
			}else{
				scores.push(-this.findBestMove(possMoves[i].pos, possMoves[i].angle, possMoves[i].speed, depth-1));
			}
			moves.push(possMoves[i]);
		}
		
		for(var j = 0; j < scores.length; j++){
			if(scores[j] >= max){
				max = scores[j];
				bestJ = j;
			}
		}
		
		bestChoice = moves[bestJ];
		return max;
	
	}
	
	this.getAllMoves = function(position, angle, speed, debug){
		var newAngle;
		var newSpeed;
		var newPosition;
		var allMoves = [];
		
		for(var v = -1; v <= 1; v++){
			for(var d = -1; d <= 1; d++){
				newAngle = this.adjustAngle(angle + d * angleInterval);
				newSpeed = this.adjustSpeed(speed + v);
				if(debug) console.log(d, v, newAngle, newSpeed);
				if(newSpeed > 0){
					newPosition = position.copy().add(
						this.getPosition(newAngle, newSpeed * ratio)
					);
					if(newPosition.x >= 0 && newPosition.y >= 0 && newPosition.x <= width && newPosition.y <= height){
						allMoves.push({pos:newPosition,dir:d,vel:v,angle:newAngle,speed:newSpeed});
					}
				}
			}
		}
		
		return allMoves;
	}
	
	this.show = function(showMoves){
		stroke(this.color);
		strokeWeight(2);
		for(var i = 0; i < this.path.length - 1; i++){
			line(this.path[i].pos.x, this.path[i].pos.y, this.path[i+1].pos.x, this.path[i+1].pos.y);
		}
		
		fill(this.color);
		noStroke();
		arc(this.position.x, this.position.y, ratio*2, ratio*2, 180+this.angle-angleInterval/2, 180+this.angle+angleInterval/2);
		
		if(showMoves){
			for(var i = 0; i < this.allMoves.length; i++){
				noFill();
				stroke(255,255,255,255);
				strokeWeight(1);
				ellipse(this.allMoves[i].pos.x, this.allMoves[i].pos.y, 10,10);
			}
		}
	}
}