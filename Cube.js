class Cube{
	constructor(){
		this.type         = 'cube';
		this.color        = [1.0,1.0,1.0,1.0];
		this.matrix       = new Matrix4();
		this.normalMatrix = new Matrix4();
		this.textureNum   = -2;
		this.cubeVerts32  = new Float32Array([
		0,0,0, 1,1,0, 1,0,0
		,
		0,0,0, 0,1,0, 1,1,0
		,
		0,1,0, 0,1,1, 1,1,1
		,
		0,1,0, 1,1,1, 1,1,0
		,
		1,1,0, 1,1,1, 1,0,0
		,
		1,0,0, 1,1,1, 1,0,1
		,
		0,1,0, 0,1,1, 0,0,0
		,
		0,0,0, 0,1,1, 0,0,1
		,
		0,0,0, 0,0,1, 1,0,1
		,
		0,0,0, 1,0,1, 1,0,0
		,
		0,0,1, 1,1,1, 1,0,1
		,
		0,0,1, 0,1,1, 1,1,1
		]);
		this.cubeVerts = [
		0,0,0, 1,1,0, 1,0,0
		,
		0,0,0, 0,1,0, 1,1,0
		,
		0,1,0, 0,1,1, 1,1,1
		,
		0,1,0, 1,1,1, 1,1,0
		,
		1,1,0, 1,1,1, 1,0,0
		,
		1,0,0, 1,1,1, 1,0,1
		,
		0,1,0, 0,1,1, 0,0,0
		,
		0,0,0, 0,1,1, 0,0,1
		,
		0,0,0, 0,0,1, 1,0,1
		,
		0,0,0, 1,0,1, 1,0,0
		,
		0,0,1, 1,1,1, 1,0,1
		,
		0,0,1, 0,1,1, 1,1,1
		];
	}
	
	render(){
		var rgba = this.color;

		// pass textureNum to u_whichTexture
		gl.uniform1i(u_whichTexture, this.textureNum);
	
		// pass the color of a point to u_FragColor var 
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		
		// pass the matrix to u_ModelMatrix attribute
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
	
		// pass the matrix to u_NormalMatrix attribute
		gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

		// front of cube 
		drawTriangle3DUVNormal( [ 0,0,0,  1,1,0, 1,0,0 ], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
		drawTriangle3DUVNormal( [ 0,0,0,  0,1,0, 1,1,0 ], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

		// back of cube
		// pass the color of a point to u_FragColor uniform variable
		// gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
		drawTriangle3DUVNormal([0,0,1, 1,0,1,  1,1,1], [0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
		drawTriangle3DUVNormal([0,0,1, 0,1,1,  1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);

		// top of cube
		// gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
		drawTriangle3DUVNormal([0,1,0,  0,1,1,  1,1,1], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
		drawTriangle3DUVNormal([0,1,0,  1,1,1,  1,1,0], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);

		// bottom of cube
		// gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
		drawTriangle3DUVNormal([0,0,0,  1,0,1,  1,0,0], [0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
		drawTriangle3DUVNormal([0,0,0,  0,0,1,  1,0,1], [0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);

		// left 
		// gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
		drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], [-1,0,0, -1,0,0, -1,0,0]);
		drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);

		// right
		// gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
		drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);
		drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
	}

	renderfast(){
		var rgba = this.color;

		// pass the color of a point to u_FragColor var 
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

		// pass the matrix to u_ModelMatrix attribute
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

		var allverts = [];

		// front of cube
		allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
		allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);

		// top of cube
		allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
		allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);
		
		// right of cube
		allverts = allverts.concat([1,1,0, 1,1,1, 1,0,0]);
		allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);

		// left of cube
		allverts = allverts.concat([0,1,0, 0,1,1, 0,0,0]);
		allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);

		// bottom of cube
		allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
		allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);

		// back of cube 
		allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
		allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
		drawTriangle3D(allverts);

	}

	renderfaster(){
		var rgba = this.color;

		gl.uniform1i(u_whichTexture, -2);

	    // pass the color of a point to u_FragColor var 
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

		// pass the matrix to u_ModelMatrix attribute
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

		if(g_vertexBuffer == null){
			initTriangle3D();
		}

		gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

		gl.drawArrays(gl.TRIANGLES, 0, 36);

	}
}
