pasy.ParticleSet = function(gl) {
	this._gl = gl;
	this._attributes = {};
	this._uniforms = {};
	this._vertex = [];
	this._fragment = [];
	this._count = 1;
	this._pointSize = 1;
	this._pointSizeMax = null;
	this._transform = mat4.create();
	this._modelview = mat4.create();
	this._program = null;
}

pasy.ParticleSet.prototype = {
	render: function(camera) {
		var gl = this._gl;

		if (!this._program) { this._createProgram(); }
		this._program.use();

		mat4.multiply(this._modelview, camera.vMatrix, this._transform);
		this._program.uniform("u_modelview", this._modelview);
		this._program.uniform("u_projection", camera.pMatrix);

		for (var p in this._uniforms) {
			this._program.uniform(p, this._uniforms[p].callback());
		}

		for (var p in this._attributes) {
			var a = this._attributes[p];
			gl.bindBuffer(gl.ARRAY_BUFFER, a.buffer);
			gl.vertexAttribPointer(this._program.attributes[p], a.components, gl.FLOAT, false, 0, 0);
		}

		gl.drawArrays(gl.POINTS, 0, this._count);
	},

	attribute: function(name, components, callback) {
		name = "a_" + name;
		var obj = {
			buffer: this._gl.createBuffer(),
			components: components,
			callback: callback
		};
		this._attributes[name] = obj;
		this._fillBuffer(obj);
		return this;
	},
	
	uniform: function(name, type, callback) {
		name = "u_" + name;
		this._uniforms[name] = {
			type: type,
			callback: callback
		};
		return this;
	},

	color: function(color) {
		if (typeof(color) == "function") { /* define an attribute */
			this.attribute("color", 3, color);
		} else { /* define a uniform */
			this.uniform("color", "vec3", function() { return color; });
		}
		return this;
	},

	count: function(count) {
		this._count = count;
		for (var p in this._attributes) {
			this._fillBuffer(this._attributes[p]);
		}
		return this;
	},

	pointSize: function(pointSize, pointSizeMax) {
		this._pointSize = pointSize;
		this._pointSizeMax = arguments.length > 1 ? pointSizeMax : null;

		if (this._program) { this._program.destroy(); }
		this._program = null;

		return this;
	},
	
	vertex: function(line) {
		this._vertex.push(line);
		return this;
	},

	fragment: function(line) {
		this._fragment.push(line);
		return this;
	},
	
	transform: function(transform) {
		this._transform = transform;
		return this;
	},

	destroy: function() {
		var gl = this._gl;
		
		if (this._program) {
			this._program.destroy();
			this._program = null;
		}
		
		for (var p in this._attributes) {
			var a = this._attributes[p];
			gl.deleteBuffer(a.buffer);
		}
		
		this._attributes = null;
		this._uniforms = null;
	},

	_fillBuffer: function(a) {
		var gl = this._gl;

		var data = a.callback(gl, this._count);
		gl.bindBuffer(gl.ARRAY_BUFFER, a.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	},

	_createProgram: function() {
		var vs = this._createVS();
		var fs = this._createFS();
		this._program = new Program(this._gl, vs, fs);
	},

	_createVS: function() {
		var lines = [];
		for (var p in this._attributes) {
			var a = this._attributes[p];
			if (a.components > 1) {
				lines.push("attribute vec" + a.components + " " + p + ";");
			} else {
				lines.push("attribute float " + p + ";");
			}
		}

		for (var p in this._uniforms) {
			var u = this._uniforms[p];
			lines.push("uniform " + u.type + " " + p + ";");
		}

		lines.push("uniform mat4 u_modelview;");
		lines.push("uniform mat4 u_projection;");

		if (this._attributes["a_color"]) {
			lines.push("varying vec3 v_color;");
		}

		lines.push("void main(void) {");
		
		lines.push.apply(lines, this._vertex);
		
		if (this._attributes["a_color"]) { lines.push("v_color = a_color;"); }

		lines.push("vec4 cameraPosition = u_modelview * vec4(position, 1.0);");
		lines.push("gl_Position = u_projection * cameraPosition;");

		if (this._pointSizeMax === null) {
			lines.push("gl_PointSize = " + this._pointSize.toFixed(2) + ";");
		} else {
			var ps = this._pointSize;
			var PS = this._pointSizeMax;
			
			lines.push("float distance2 = abs(dot(cameraPosition, cameraPosition)) - 1.0;");
			lines.push("gl_PointSize = " + this._pointSize.toFixed(2) + " + " + this._pointSizeMax.toFixed(2) + " * 2.0 / distance2;");
		}

		lines.push("}");
		return lines.join("\n");
	},

	_createFS: function() {
		var lines = [];
		lines.push("precision highp float;");
		
		if (this._attributes["a_color"]) {
			lines.push("varying vec3 v_color;");
		}

		for (var p in this._uniforms) {
			var u = this._uniforms[p];
			lines.push("uniform " + u.type + " " + p + ";");
		}

		lines.push("void main(void) {");
		lines.push("float dist = length((gl_PointCoord-0.5)*2.0);");
		lines.push("if (dist > 1.0) { discard; }");

		lines.push("float alpha = 1.0-dist;");
		lines.push("alpha = sin(alpha * 1.571);");
		
		lines.push.apply(lines, this._fragment);
		
		if (this._attributes["a_color"]) {
			lines.push("gl_FragColor = vec4(v_color, alpha);");
		} else {
			lines.push("gl_FragColor = vec4(u_color, alpha);");
		}
		
		lines.push("}");
		return lines.join("\n");
	}
}

