pasy.Control = function(parent, options, callback) {
	this._options = {
		min: 0,
		max: 100,
		value: 50,
		height: 32,
		font: 16,
		round: 0,
		scale: "linear",
		label: "value"
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._callback = callback;

	var node = document.createElement("canvas");
	parent.appendChild(node);

	node.width = node.clientWidth;
	node.height = this._options.height;

	var ctx = node.getContext("2d");
	ctx.fillStyle = "blue";
	ctx.strokeStyle = "#fff";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold " + this._options.font + "px sans-serif";
	this._ctx = ctx;

	this.setValue(this._options.value);

	node.addEventListener("mousedown", this);
}

pasy.Control.prototype = {
	handleEvent: function(e) {
		switch (e.type) {
			case "mousedown":
				document.addEventListener("mousemove", this);
				document.addEventListener("mouseup", this);
				this._processMouse(e.clientX);
			break;

			case "mousemove":
				this._processMouse(e.clientX);
			break;

			case "mouseup":
				document.removeEventListener("mousemove", this);
				document.removeEventListener("mouseup", this);
			break;
		}

	},

	setValue: function(value) {
		value = this._validate(value);
		this._draw(value);
		this._callback && this._callback(value);
	},

	_processMouse: function(clientX) {
		var o = this._options;

		var rect = this._ctx.canvas.getBoundingClientRect();
		var frac = (clientX - rect.left) / this._ctx.canvas.clientWidth;
		frac = this._scale[o.scale].size2value(frac);

		var value = o.min+(o.max-o.min)*frac;
		this.setValue(value);
	},

	_draw: function(value) {
		var o = this._options;
		var w = this._ctx.canvas.width;
		var h = this._ctx.canvas.height;
		this._ctx.clearRect(0, 0, w, h);

		var frac = (value-o.min)/(o.max-o.min);
		frac = this._scale[o.scale].value2size(frac);
		w *= frac;

		this._ctx.fillStyle = "#26a";
		this._ctx.fillRect(0, 0, w, h);

		var text = o.label + ": " + (o.round ? value : value.toFixed(2));
		this._ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		this._ctx.fillText(text, this._ctx.canvas.width/2, h/2);
	},

	_validate: function(value) {
		var o = this._options;
		var max = Math.max(o.min, o.max);
		var min = Math.min(o.min, o.max);

		if (o.round) {
			value = o.round * Math.round(value / o.round);
		}
		value = Math.max(value, min);
		value = Math.min(value, max);

		return value;
	},

	_scale: {
		linear: {
			 value2size: function(value) {
			 	return value;
			 },
			 size2value: function(size) {
			 	return size;
			 }
		},
		log10: {
			 value2size: function(value) {
			 	var base = 10;
			 	return Math.log((base-1)*value + 1) / Math.log(base);
			 },
			 size2value: function(size) {
			 	var base = 10;
			 	return (Math.pow(base, size) - 1)/(base-1)
			 }
		}
	}
}
