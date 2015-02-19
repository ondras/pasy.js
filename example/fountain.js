var scene = new pasy.Scene(document.body)
	.theta(1)
	.distance(2)

var count = 5e4;
var life = 5;
var gravity = 1;
var angle = 0.3;
var now = Date.now();

var ps = scene.particleSet()
	.pointSize(1, 6)
	.count(count)
	.color([.1, .2, .4])
	.time()
	.uniform("gravity", "vec3", function() { return [0, -gravity, 0]; })
	.uniform("life", "float", function() { return life; })
	.uniform("angle", "float", function() { return angle; })
	.attribute("random", 3, function(gl, count) {
		var data = [];
		for (var i=0;i<count;i++) {
			data.push(Math.random());
			data.push(Math.random());
			data.push(Math.random());
		}
		return new Float32Array(data);
	})
	.vertex("float theta = u_angle + a_random[0]/20.0;")
	.vertex("float phi = a_random[1]*6.282;")
	.vertex("float z = sin(theta) * cos(phi);")
	.vertex("float x = sin(theta) * sin(phi);")
	.vertex("float y = cos(theta);")
	.vertex("float age = mod(u_time + a_random[2]*u_life, u_life);")
	.vertex("age = 3.0 * age / u_life;")
	.vertex("vec3 position = age * vec3(x, y, z) + 0.5 * u_gravity * age * age;")

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
	max: 20,
	value: life,
	callback: function(x) { life = x; }
});

scene.control({
	label: "gravity",
	min: 0,
	max: 3,
	value: gravity,
	callback: function(x) { gravity = x; }
});

scene.control({
	label: "angle",
	min: 0,
	max: 1,
	value: angle,
	callback: function(x) { angle = x; }
});
