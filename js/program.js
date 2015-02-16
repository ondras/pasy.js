var Program = function(gl, vsSource, fsSource) {
	this._gl = gl;
	this.attributes = {};
	this._uniforms = {};

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
		this._uniforms[info.name] = this._uniformSetter(info, program);
	}

	this._program = program;
}

Program.prototype.use = function() {
	var gl = this._gl;
	gl.useProgram(this._program);

	for (var p in this.attributes) { 
		gl.enableVertexAttribArray(this.attributes[p]);
	}
}

Program.prototype.destroy = function() {
	this._gl.deleteProgram(this._program);
}

Program.prototype.uniform = function(name, value) {
	this._uniforms[name](value);
}

Program.prototype._uniformSetter = function(info, program) {
	var gl = this._gl;
	var location = gl.getUniformLocation(program, info.name);

	var type = info.type;
	// Check if this uniform is an array
	var isArray = (info.size > 1 && info.name.substr(-3) == "[0]");
	if (type == gl.FLOAT && isArray)
		return function(v) { gl.uniform1fv(location, v); };
	if (type == gl.FLOAT)
		return function(v) { gl.uniform1f(location, v); };
	if (type == gl.FLOAT_VEC2)
		return function(v) { gl.uniform2fv(location, v); };
	if (type == gl.FLOAT_VEC3)
		return function(v) { gl.uniform3fv(location, v); };
	if (type == gl.FLOAT_VEC4)
		return function(v) { gl.uniform4fv(location, v); };
	if (type == gl.INT && isArray)
		return function(v) { gl.uniform1iv(location, v); };
	if (type == gl.INT)
		return function(v) { gl.uniform1i(location, v); };
	if (type == gl.INT_VEC2)
		return function(v) { gl.uniform2iv(location, v); };
	if (type == gl.INT_VEC3)
		return function(v) { gl.uniform3iv(location, v); };
	if (type == gl.INT_VEC4)
		return function(v) { gl.uniform4iv(location, v); };
	if (type == gl.BOOL)
		return function(v) { gl.uniform1iv(location, v); };
	if (type == gl.BOOL_VEC2)
		return function(v) { gl.uniform2iv(location, v); };
	if (type == gl.BOOL_VEC3)
		return function(v) { gl.uniform3iv(location, v); };
	if (type == gl.BOOL_VEC4)
		return function(v) { gl.uniform4iv(location, v); };
	if (type == gl.FLOAT_MAT2)
		return function(v) { gl.uniformMatrix2fv(location, false, v); };
	if (type == gl.FLOAT_MAT3)
		return function(v) { gl.uniformMatrix3fv(location, false, v); };
	if (type == gl.FLOAT_MAT4)
		return function(v) { gl.uniformMatrix4fv(location, false, v); };
	if ((type == gl.SAMPLER_2D || type == gl.SAMPLER_CUBE) && isArray) {
		var units = [];
		for (var i = 0; i < info.size; i++) {
			units.push(textureUnit++);
		}
		return function(bindPoint, units) {
			return function(textures) {
				gl.uniform1iv(location, units);
				textures.forEach(function(texture, index) {
					gl.activeTexture(gl.TEXTURE0 + units[index]);
					gl.bindTexture(bindPoint, tetxure);
				});
			}
		}(getBindPointForSamplerType(gl, type), units);
	}
	if (type == gl.SAMPLER_2D || type == gl.SAMPLER_CUBE)
		return function(bindPoint, unit) {
			return function(texture) {
				gl.uniform1i(location, unit);
				gl.activeTexture(gl.TEXTURE0 + unit);
				gl.bindTexture(bindPoint, texture);
			};
		}(getBindPointForSamplerType(gl, type), textureUnit++);
	
	throw ("Unknown uniform type: 0x" + type.toString(16));
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
