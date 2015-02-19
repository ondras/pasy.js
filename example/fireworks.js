var scene = new pasy.Scene(document.body)
	.distance(3);

var count = 2e3;

var explode = function() {
	var ps = scene.particleSet();
	
	var transform = mat4.create();
	mat4.translate(transform, transform, [
		2*(Math.random()-0.5),
		Math.random()-0.5,
		2*(Math.random()-0.5)
	]);

	var now = Date.now();
	var life = 2;
	ps
		.transform(transform)
		.pointSize(2, 20)
		.count(count)
		.color([Math.random(), Math.random(), Math.random()])
		.time()
		.uniform("gravity", "vec3", function() { return [0, -0.5, 0]; })
		.uniform("life", "float", function() { return life; })
		.attribute("velocity", 3, function(gl, count) {
			return pasy.randomSet(count, vec3, 0.1);
		})
		.vertex("float age = u_time;")
		.vertex("vec3 position = log(1.0 + age * 2.0) * a_velocity + 0.5 * u_gravity * age * age;")
		.fragment("alpha = alpha * (1.0 - u_time/u_life);");
	
	scene.add(ps);
	
	setTimeout(function() {
		explode();
	}, 1000 * life * 0.6);

	setTimeout(function() {
		scene.remove(ps);
		ps.destroy();
	}, 1000 * life);
}

explode();

scene.control({
	label: "particles",
	min: 1e2,
	max: 5e4,
	scale: "log",
	round: 1e2,
	value: count,
	callback: function(x) { count = x; }
});
