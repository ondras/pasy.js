pasy.Scene = function(parent) {
	this._particleSets = [];
	this._camera = new Camera();
	this._now = Date.now();

	this._eye = {
		distance: 1,
		rotation: 0,
		position: vec3.create(),
		up: vec3.fromValues(0, 1, 0),
		center: vec3.create(),
		theta: Math.PI/2,
		phi: 0,
		mouse: null
	}

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
	
	node.addEventListener("mousedown", this);

	parent.appendChild(node);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	this._gl = gl;
	this._sync();

	this._fps = new pasy.FPS(parent);
	this.fps({right:"10px", top:"10px"});

	this._controls = document.createElement("div");
	var style = {
		position: "absolute",
		right: 0,
		bottom: 0,
		width: "200px"
	};

	for (var p in style) { this._controls.style[p] = style[p]; }

	parent.appendChild(this._controls);

	this._tick = this._tick.bind(this);
	this._tick();
}

pasy.Scene.prototype = {
	handleEvent: function(e) {
		switch (e.type) {
			case "mousedown":
				document.addEventListener("mousemove", this);
				document.addEventListener("mouseup", this);
				document.addEventListener("mouseout", this);
				this._eye.mouse = [e.clientX, e.clientY];
			break;

			case "mousemove":
				var deltaX = e.clientX-this._eye.mouse[0];
				var deltaY = e.clientY-this._eye.mouse[1];
				this._eye.mouse = [e.clientX, e.clientY];
				this._eye.theta -= (Math.PI * deltaY) / (e.target.clientHeight);
				this._eye.phi -= (2*Math.PI * deltaX) / (e.target.clientWidth);
			break;

			case "mouseout":
			case "mouseup":
				this._eye.mouse = null;
				document.removeEventListener("mousemove", this);
				document.removeEventListener("mouseup", this);
				document.removeEventListener("mouseout", this);
			break;
		}
	},

	particleSet: function() {
		return new pasy.ParticleSet(this._gl);
	},

	control: function(options, callback) {
		return new pasy.Control(this._controls, options, callback);
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
		this._eye.distance = distance;
		return this;
	},

	rotate: function(rotation) {
		this._eye.rotation = rotation;
		return this;
	},
	
	theta: function(theta) {
		this._eye.theta = theta;
		return this;
	},

	phi: function(phi) {
		this._eye.phi = phi;
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
		
		/* camera/eye adjustment */
		var now = Date.now();
		if (!this._eye.mouse) { 
			this._eye.phi += (now - this._now) * this._eye.rotation / 1e4;
		}
		this._now = now;

		var R = this._eye.distance;
		this._eye.position[0] = R * Math.sin(this._eye.theta) * Math.sin(this._eye.phi);
		this._eye.position[1] = R * Math.cos(this._eye.theta);
		this._eye.position[2] = R * Math.sin(this._eye.theta) * Math.cos(this._eye.phi);
		camera.lookAt(this._eye.position, this._eye.center, this._eye.up);

		gl.clear(gl.COLOR_BUFFER_BIT);

		this._particleSets.forEach(function(particleSet) {
			particleSet.render(camera);
		});

	}
}
