var scene = new pasy.Scene(document.body)
	.distance(1.4)
	.theta(0.7)
	.rotate(1)

var count = 1e5;
var scale = 30;
var dampening = 3;

var ps = scene.particleSet()
	.count(count)
	.pointSize(3)
	.uniform("scale", "float", function() { return scale; })
	.uniform("dampening", "float", function() { return dampening; })
	.time()
	.color(function(gl, count) {
		var data = [];
		for (var i=0;i<count;i++) {
			data.push(Math.random()*0.2);
			data.push(Math.random()*0.4 + 0.1);
			data.push(Math.random()*0.5 + 0.2);
		}
		return new Float32Array(data);
	})
	.attribute("position", 2, function(gl, count) {
		var data = [];
		for (var i=0;i<count;i++) {
			data.push(Math.random()-0.5);
			data.push(Math.random()-0.5);
		}
		return new Float32Array(data);
	})
	.vertex("float dist = length(a_position);")
	.vertex("float t = -3.0*u_time + u_scale*dist;")
	.vertex("float y = 0.06 * sin(t) * exp(-dist*u_dampening);")
	.vertex("vec3 position = vec3(a_position.x, y, a_position.y);");

scene.add(ps);

scene.control({
	label: "particles",
	min: 1e3,
	max: 5e5,
	scale: "log",
	round: 1e3,
	value: count,
	callback: function(x) { ps.count(x); }
});

scene.control({
	label: "scale",
	min: 1,
	max: 100,
	value: scale,
	callback: function(x) { scale = x; }
});

scene.control({
	label: "dampening",
	min: 1,
	max: 10,
	value: dampening,
	callback: function(x) { dampening = x; }
});
