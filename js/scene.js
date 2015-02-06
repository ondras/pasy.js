pasy.Scene = function(parent) {
	this._particleSets = [];
	this._camera = new Camera();
	this._gravity = vec3.fromValues(0, -1e-7, 0);
	this._eye = vec3.create();
	this._center = vec3.create();
	this._up = vec3.fromValues(0, 1, 0);

	var o = {
		alpha: false
	}

	var node = document.createElement("canvas");
	this._node = node;

	var gl = node.getContext("webgl", o) || node.getContext("experimental-webgl", o);

	if (!gl) {
		alert("Sorry, no WebGL API support detected. Get a modern browser and come back again.");
		return;
	}

	parent.appendChild(node);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	this._gl = gl;
	this._sync();

	this._tick = this._tick.bind(this);
	this._tick();
}

pasy.Scene.prototype = {
	particleSet: function() {
		return new pasy.ParticleSet(this._gl);
	},

	add: function(particleSet) {
		var index = this._particleSets.indexOf(particleSet);
		if (index == -1) { this._particleSets.push(particleSet); }
		return this;
	},

	remove: function(particleSet) {
		var index = this._particleSets.indexOf(particleSet);
		if (index != -1) { this._particleSets.splice(index, 1); }
		return this;
	},

	size: function(x, y) {
		this._node.style.width = x + "px";
		this._node.style.height = y + "px";
		this._sync();
	},

	_sync: function() {
		this._node.width = this._node.clientWidth;
		this._node.height = this._node.clientHeight;
		this._camera.syncPort(this._node);
		this._gl.viewport(0, 0, this._node.width, this._node.height);
	},

	_tick: function() {
		requestAnimationFrame(this._tick);
		var gl = this._gl;

		if (this._node.width != this._node.clientWidth || this._node.height != this._node.clientHeight) {
			this._sync();
		}
		
		/* program-independent stuff */

		var now = Date.now();
//		gl.uniform1i(u.uCurrentTime, now);
		var t = now / 3e4;
		var R = 20;
		this._eye[0] = R*Math.cos(t);
		this._eye[2] = R*Math.sin(t);
		this._camera.lookAt(this._eye, this._center, this._up);

		gl.clear(gl.COLOR_BUFFER_BIT);
		this._particleSets.forEach(function(particleSet) {

//			gl.uniformMatrix4fv(u.uProjection, false, this._camera.pMatrix);
//			gl.uniform3fv(u.uGravity, this._gravity);
			particleSet.render();

		});

	}
}
