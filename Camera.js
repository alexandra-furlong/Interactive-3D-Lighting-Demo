class Camera{
	constructor(){
		this.fov   = 60;
		this.alpha = 5;
		this.speed = 1.5;
		this.eye   = new Vector3( [0,0,4] );
		this.at    = new Vector3( [0,0,-1] );
		this.up    = new Vector3( [0,1,0] );
	}

	moveForward(){
		var f = new Vector3; 
		// f = at - eye
		f.set(this.at);
		f.sub(this.eye);
		f.normalize();
		f.mul(this.speed);
		this.at.add(f);
		this.eye.add(f);
	}

	moveBack(){
		var back = new Vector3;
		// back = eye - at
		back.set(this.eye);
		back.sub(this.at);
		back.normalize();
		back.mul(this.speed);
		this.at.add(back);
		this.eye.add(back);
	}

	moveLeft(){
		var left = new Vector3;
		// left = at - eye
		left.set(this.at);
		left.sub(this.eye);
		left.normalize();
		var crossProd = Vector3.cross(this.up, left);
		left.mul(this.speed);
		this.at.add(crossProd);
		this.eye.add(crossProd);
	}

	moveRight(){
		var right = new Vector3;
		// right = eye - at
		right.set(this.eye);
		right.sub(this.at);
		right.normalize();
		var crossProd = Vector3.cross(this.up, right);
		right.mul(this.speed);
		this.at.add(crossProd);
		this.eye.add(crossProd);
	}

	panLeft(){
		var panL = new Vector3;
		// panL = at - eye
		panL.set(this.at);
		panL.sub(this.eye);
		let rotationMatrix = new Matrix4();
		rotationMatrix.setIdentity();
		rotationMatrix.setRotate(1 * this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		let panL_prime = rotationMatrix.multiplyVector3(panL);
		this.at = panL_prime.add(this.eye);
	}

	panRight(){
		var panR = new Vector3;
		// panR = at - eye
		panR.set(this.at);
		panR.sub(this.eye);
		let rotationMatrix = new Matrix4();
		rotationMatrix.setIdentity();
		rotationMatrix.setRotate((-1) * (this.alpha), this.up.elements[0], this.up.elements[1], this.up.elements[2]);
		let panR_prime = rotationMatrix.multiplyVector3(panR);
		this.at = panR_prime.add(this.eye);
	}
}