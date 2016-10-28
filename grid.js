function Grid(ratio) {

	this.ratio = ratio;
		
	this.show = function(){
		stroke(120,121,122);
		strokeWeight(1);
		for(var i = ratio; i <= width; i += ratio){
			line(i, 0, i, height);
		}
		for(var i = ratio; i <= height; i += ratio){
			line(0, i, width, i);
		}
	}
}