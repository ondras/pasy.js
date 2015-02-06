pasy.ParticleSet = function(gl) {
	this._gl = gl;
	this._attributes = {};
	this._color = [1, 1, 1]; /* controls the "a_color" attribute + "v_color" varying OR the "u_color" uniform */
	this._count = 1;
	this._pointSize = 1;
	this._program = null;
}

pasy.ParticleSet.prototype = {
	render: function(camera) {
		var gl = this._gl;

		if (!this._program) { this._createProgram(); }
		this._program.use();

		var now = Date.now();
		gl.uniform1i(this._program.uniforms.u_now, Date.now());


		gl.uniformMatrix4fv(this._program.uniforms.u_view, false, camera.vMatrix);
		gl.uniformMatrix4fv(this._program.uniforms.u_projection, false, camera.pMatrix);

		if (this._color) {
			gl.uniform3fv(this._program.uniforms.u_color, this._color);
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

	color: function(color) {
		if (typeof(color) == "function") { /* define an attribute */
			this._color = null;
			this.attribute("color", 3, color);
		} else { /* define a uniform */
			this._color = color;
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

	pointSize: function(pointSize) {
		this._pointSize = pointSize;

		if (this._program) { this._program.destroy(); }
		this._program = null;

		return this;
	},

	destroy: function() {
		/* FIXME */
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
			lines.push("attribute vec" + a.components + " " + p + ";");
		}

		if (!this._color) {
			lines.push("varying vec3 v_color;");
		}

		lines.push("uniform int u_now;");
		lines.push("uniform mat4 u_view;");
		lines.push("uniform mat4 u_projection;");

		lines.push("void main(void) {");
		lines.push("gl_PointSize = " + this._pointSize.toFixed(2) + ";");

		if (!this._color) {
			lines.push("v_color = a_color;");
		}

		lines.push("gl_Position = u_projection * u_view * vec4(a_velocity, 1.0);");
		lines.push("}");
		return lines.join("\n");
	},

	_createFS: function() {
		var lines = [];
		lines.push("precision highp float;");
		
		if (this._decay) {
			lines.push("varying float vDecay;");
		}
		
		if (!this._color) {
			lines.push("varying vec3 v_color;");
		} else {
			lines.push("uniform vec3 u_color;");
		}
		
		lines.push("void main(void) {");
		lines.push("float dist = length((gl_PointCoord-0.5)*2.0);");
		lines.push("if (dist > 1.0) { discard; }");

		lines.push("float alpha = 1.0-dist;");
		lines.push("alpha = pow(alpha, 0.7);"); // FIXME?
		
		if (this._decay) {
			lines.push("alpha = alpha * vDecay;");
		}
		
		if (this._color) {
			lines.push("gl_FragColor = vec4(u_color, alpha);");
		} else {
			lines.push("gl_FragColor = vec4(v_color, alpha);");
		}
		
		lines.push("}");
		return lines.join("\n");
	}
}

