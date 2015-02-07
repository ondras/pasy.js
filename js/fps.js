pasy.FPS = function(parent) {
	this._node = document.createElement("div");
	parent.appendChild(this._node);
	
	this._node.style.position = "absolute";
	this._node.style.fontSize = "10vh";
	this._node.style.color = "#fff";
	
	this._last = Date.now();
	this._ticks = 0;
}

pasy.FPS.prototype = {
	configure: function(style) {
		if (style === null) {
			this._node.style.display = "none";
			return;
		}
		
		this._node.style.display = "";
		for (var p in style) { this._node.style[p] = style[p]; }
	},

	tick: function() {
		this._ticks++;
		var now = Date.now();
		var dt = now - this._last;
		if (dt > 200) {
			this._last = now;
			var fps = 1000 * this._ticks / dt;
			this._node.innerHTML = fps.toFixed(0);
			this._ticks = 0;
		}
	}
}

