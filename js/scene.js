pasy.Scene = function(parent) {
	this._particleSets = [];
	this._camera = new Camera();

	this._distance = 1;
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

	this._fps = new pasy.FPS(parent);
	this.fps({right:"10px", top:"10px"});

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
	
	fps: function(style) {
		this._fps.configure(style);
	},

	distance: function(distance) {
		this._distance = distance;
		return this;
	},

	_sync: function() {
		this._node.width = this._node.clientWidth;
		this._node.height = this._node.clientHeight;
		this._camera.syncPort(this._node);
		this._gl.viewport(0, 0, this._node.width, this._node.height);
	},

	_tick: function() {
		requestAnimationFrame(this._tick);
		this._fps.tick();
		var gl = this._gl;
		var camera = this._camera;

		if (this._node.width != this._node.clientWidth || this._node.height != this._node.clientHeight) {
			this._sync();
		}
		
		/* program-independent stuff */

		var t = Date.now() / 1e3 * 0;
		this._eye[0] = this._distance*Math.cos(t);
		this._eye[2] = this._distance*Math.sin(t);
		camera.lookAt(this._eye, this._center, this._up);

		gl.clear(gl.COLOR_BUFFER_BIT);

		this._particleSets.forEach(function(particleSet) {
			particleSet.render(camera);
		});

	}
}
