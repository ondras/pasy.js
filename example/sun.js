var scene = new pasy.Scene(document.body)
	.distance(2)
	.rotate(2)

var count = 1e5;
var size = [1, 3];

var ps = scene.particleSet()
	.count(count)
	.pointSize(size[0], size[1])
	.color([.4, .2, .1])
	.attribute("position", 3, function(gl, count) {
		return pasy.randomSet(count, vec3, 0.05);
	})
	.vertex("vec3 position = a_position;");

scene.add(ps);

scene.control({
	label: "particles",
	min: 1e3,
	max: 2e6,
	scale: "log",
	round: 1e3,
	value: count,
	callback: function(x) { ps.count(x); }
});

scene.control({
	label: "min size",
	min: 0,
	max: 5,
	value: size[0],
	callback: function(x) { size[0] = x; ps.pointSize(size[0], size[1]); }
});

scene.control({
	label: "max size",
	min: 0,
	max: 30,
	value: size[1],
	callback: function(x) { size[1] = x; ps.pointSize(size[0], size[1]); }
});

