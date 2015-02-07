var scene = new pasy.Scene(document.body);
scene.fps({right:"10px", top:"10px"});

var ps = scene.particleSet();

ps
	.pointSize(2)
	.count(1000000)
	.color([.8, .4, .1])
	.attribute("velocity", 3, function(gl, count) {
		return pasy.randomSet(count, vec3, 0.1);
	})
/*	.color(function(gl, count) {
		return pasy.randomSet(count, vec3, 0);
	});
*/
scene.add(ps);
