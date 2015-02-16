var scene = new pasy.Scene(document.body);
scene
	.distance(2)
	.rotate(2)

var ps = scene.particleSet();

ps
	.pointSize(1, 3)
	.count(1000000)
	.color([.4, .2, .1])
	.attribute("position", 3, function(gl, count) {
		return pasy.randomSet(count, vec3, 0.05);
	})
	.vertex("vec3 position = a_position;");

scene.add(ps);
