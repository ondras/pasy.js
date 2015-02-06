var Program = function(gl, vsSource, fsSource) {
	this._gl = gl;
	this.attributes = {};
	this.uniforms = {};

	var vs = this._shaderFromString(gl.VERTEX_SHADER, vsSource);
	var fs = this._shaderFromString(gl.FRAGMENT_SHADER, fsSource);

	var program = gl.createProgram();
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error("Could not link the shader program");
	}

	gl.deleteShader(vs);
	gl.deleteShader(fs);

	var count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for (var i=0; i<count; i++) {
		var info = gl.getActiveAttrib(program, i);
		this.attributes[info.name] = gl.getAttribLocation(program, info.name);
	}

	var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (var i=0; i<count; i++) {
		var info = gl.getActiveUniform(program, i);
		this.uniforms[info.name] = gl.getUniformLocation(program, info.name);
	}

	this.program = program;
}

Program.prototype.use = function() {
	var gl = this._gl;
	gl.useProgram(this.program);

	for (var p in this.attributes) { 
		gl.enableVertexAttribArray(this.attributes[p]);
	}
}

Program.prototype._shaderFromId = function(id) {
	var node = document.querySelector("#" + id);
	if (!node) { throw new Error("Cannot find shader for ID '"+id+"'"); }

	var gl = this._gl;

	var src = "";
	var child = node.firstChild;

	while (child) {
		if (child.nodeType == child.TEXT_NODE) { src += child.textContent; }
		child = child.nextSibling;
	}

	if (node.type == "x-shader/x-fragment") {
		var type = gl.FRAGMENT_SHADER;
	} else if (node.type == "x-shader/x-vertex") {
		var type = gl.VERTEX_SHADER;
	} else {
		throw new Error("Unknown shader type '" + node.type +"'");
	}

	return this._shaderFromString(type, src);
}

Program.prototype._shaderFromString = function(type, str) {
	var gl = this._gl;

	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Could not compile shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
}
