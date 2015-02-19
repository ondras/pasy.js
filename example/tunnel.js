var scene = new pasy.Scene(document.body)
	.distance(0.1)

var count = 1e5;
var life = 15;

var now = Date.now();
var ps = scene.particleSet()
	.pointSize(1, 50)
	.count(count)
	.color(function(gl, count) {
		return pasy.randomSet(count, vec3);
	})
	.time()
	.uniform("life", "float", function() { return life; })
	.uniform("depth", "float", function() { return 40; })
	.attribute("position", 2, function(gl, count) {
		return pasy.randomSet(count, vec2);
	})
	.attribute("depth", 1, function(gl, count) {
		var data = [];
		for (var i=0;i<count;i++) {
			data.push(Math.random());
		}
		return new Float32Array(data);
	})
	.vertex("float age = mod(u_time + a_depth * u_life, u_life);")
	.vertex("vec3 position = vec3(a_position, u_depth * (age / u_life - 1.0));")

scene.add(ps);

scene.control({
	label: "particles",
	min: 1e3,
	max: 1e6,
	scale: "log",
	round: 1e3,
	value: count,
	callback: function(x) { ps.count(x); }
});

scene.control({
	label: "lifetime",
	min: 1,
	max: 100,
	value: life,
	callback: function(x) { life = x; }
});
