pasy.Scene = function() {
	this._node = document.createElement("canvas");
	this._camera = null;
	this._gravity = vec3.fromValues(0, -1e-7, 0);
	this._eye = vec3.create();
	this._center = vec3.create();
	this._up = vec3.fromValues(0, 1, 0);

	var o = {
		alpha: false
	}

	var gl = this._node.getContext("webgl", o) || this._node.getContext("experimental-webgl", o);
	this._gl = gl;

	if (!gl) {
		alert("Sorry, no WebGL API support detected. Get a modern browser and come back again.");
		return;
	}

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	this._tick = this._tick.bind(this);
	this._tick();
}

pasy.Scene.prototype = {
	size: function(x, y) {
		this._node.style.width = x + "px";
		this._node.style.height = y + "px";
		this._sync();
	},

	camera: function(camera) {
		this._camera = camera;
		this._sync();
		return this;
	},
	
	_sync: function() {
		this._camera.syncPort(this._node);
		this._gl.viewport(0, 0, this._node.width, this._node.height);
	},

	_tick: function() {
		requestAnimationFrame(this._tick);
		var gl = this._gl;
		
		/* program-independent stuff */

		var now = Date.now();
		gl.uniform1i(u.uCurrentTime, now);
		var t = now / 3e4;
		var R = 20;
		this._eye[0] = R*Math.cos(t);
		this._eye[2] = R*Math.sin(t);
		this._camera.lookAt(this._eye, this._center, this._up);

		gl.clear(gl.COLOR_BUFFER_BIT);

		var program = this._programs.explosions;
		program.use();
		var u = program.uniforms;

		gl.uniformMatrix4fv(u.uProjection, false, this._camera.pMatrix);
		gl.uniform3fv(u.uGravity, this._gravity);
	}
}
