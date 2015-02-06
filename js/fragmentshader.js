pasy.FragmentShader = function() {
	this._decay = false;
	this._color = [1, 1, 1];
}

pasy.FragmentShader.prototype = {
	color: function(color) {
		this._color = color;
		return this;
	},
	
	decay: function(decay) {
		this._decay = decay;
		return this;
	},
	
	toString: function() {
		var lines = [];
		lines.push("precision highp float;");
		
		if (this._decay) {
			lines.push("varying float vDecay;");
		}
		
		if (!this._color) {
			lines.push("varying vec3 vColor;");
		}
		
		lines.push("void main(void) {");
		lines.push("float dist = length((gl_PointCoord-0.5)*2.0);");
		lines.push("if (dist > 1.0) { discard; }");

		lines.push("float alpha = 1.0-dist;");
		lines.push("alpha = pow(alpha, 3.0);"); // FIXME?
		
		if (this._decay) {
			lines.push("alpha = alpha * vDecay;");
		}
		
		if (this._color) {
			var color = this._color.map(function($) { return $.toFixed(2); });
			lines.push("gl_FragColor = vec4(" + color.join(",") + ", alpha);");
		} else {
			lines.push("gl_FragColor = vec4(vColor, alpha);");
		}
		
		lines.push("}");
		return lines.join("\n");
	}
}
