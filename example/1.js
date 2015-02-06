var scene = new pasy.Scene(document.body);

var ps = scene.particleSet();

ps
	.pointSize(3)
	.count(100000)
	.color([.8, .4, .1])
	.attribute("velocity", 3, function(gl, count) {
		return pasy.randomSet(count, vec3, 0.05);
	})
/*	.color(function(gl, count) {
		return pasy.randomSet(count, vec3, 0);
	});
*/
scene.add(ps);