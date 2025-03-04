class Polyhedron{
	constructor(){
		this.type='polyhedron';
		// this.position = [0.0,0.0,0.0];
		this.color    = [1.0,1.0,1.0,1.0];
		// this.size     = 5.0;
		// this.segments = 10;
		this.matrix = new Matrix4();
	}
	
	render(){
		// var xy   = this.position;
		var rgba = this.color;
		// var size = this.size;
	
		// pass the color of a point to u_FragColor var 
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		
		// pass the matrix to u_ModelMatrix attribute
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

		// front of polyhedron 
		drawTriangle3DUVNormal([ 0,0,0, .5,1,.5, 1,0,0 ], [0,0, .5,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);

		// back of polyhedron
		// pass the color of a point to u_FragColor uniform variable
		drawTriangle3DUVNormal([0,0,1, .5,1,.5,  1,0,1], [0,0, .5,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);

		// bottom of cube
		drawTriangle3DUVNormal([0,0,0,  1,0,1,  1,0,0], [0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
		drawTriangle3DUVNormal([0,0,0,  0,0,1,  1,0,1], [0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);

		// left 
		drawTriangle3DUVNormal([0,0,0, .5,1,.5, 0,0,1], [0,0, .5,1, 0,0], [-1,0,0, -1,0,0, -1,0,0]);

		// right
		drawTriangle3DUVNormal([1,0,0, .5,1,.5, 1,0,1], [1,0, .5,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);
	}
}