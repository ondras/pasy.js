pasy.ParticleSet = function(gl) {
	this._gl = gl;
	this._attributes = {};
	this._color = [1, 1, 0];
	this._count = 3;
	this._program = null;
}

pasy.ParticleSet.prototype = {
	render: function() {
		var gl = this._gl;

		if (!this._program) { this._createProgram(); }

		this._program.use();

		/* fixme */
		gl.uniform3fv(this._program.uniforms.uColor, this._color);

		for (var p in this._attributes) {
			var a = this._attributes[p];
			gl.bindBuffer(gl.ARRAY_BUFFER, a.buffer);
			gl.vertexAttribPointer(a.location, a.length, gl.FLOAT, false, 0, 0);
		}


		gl.drawArrays(gl.POINTS, 0, this._count);
	},

	attribute: function(name, def, callback) {
		var obj = {
			buffer: this._gl.createBuffer(),
			location: 0,
			length: 3,
			callback: callback
		};
		for (var p in def) { obj[p] = def[p]; }
		this._attributes[name] = obj;

		this._fillBuffer(obj);
	},

	count: function(count) {
		this._count = 0;
		for (var p in this._attributes) {
			this._fillBuffer(this._attributes[p]);
		}
	},

	destroy: function() {
		/* FIXME */
	},

	_fillBuffer: function(attribute) {
		attribute.callback(this._gl, attribute.buffer, this._count);
	},

	_createProgram: function() {
		var vs = this._createVS();
		var fs = this._createFS();
		this._program = new Program(this._gl, vs, fs);

		for (var p in this._attributes) { 
			this._attributes[p].location = this._program.attributes[p];
		}
	},

	_createVS: function() {
		var lines = [];
		for (var p in this._attributes) {
			var a = this._attributes[p];
			lines.push("attribute vec" + a.length + " " + p + ";");
		}
		lines.push("void main(void) {");
		lines.push("gl_PointSize = 16.0;");
		lines.push("gl_Position = vec4(velocity, 1.0);");
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
			lines.push("varying vec3 vColor;");
		} else {
			lines.push("uniform vec3 uColor;");
		}
		
		lines.push("void main(void) {");
		lines.push("float dist = length((gl_PointCoord-0.5)*2.0);");
		lines.push("if (dist > 1.0) { discard; }");

		lines.push("float alpha = 1.0-dist;");
		lines.push("alpha = pow(alpha, 1.0);"); // FIXME?
		
		if (this._decay) {
			lines.push("alpha = alpha * vDecay;");
		}
		
		if (this._color) {
			lines.push("gl_FragColor = vec4(uColor, alpha);");
			/*
			var color = this._color.map(function($) { return $.toFixed(2); });
			lines.push("gl_FragColor = vec4(" + color.join(",") + ", alpha);");
			*/
		} else {
			lines.push("gl_FragColor = vec4(vColor, alpha);");
		}
		
		lines.push("}");
		return lines.join("\n");
	}
}

