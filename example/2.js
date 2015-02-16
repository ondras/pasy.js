var scene = new pasy.Scene(document.body);

var ps = scene.particleSet();
var now = Date.now();
ps
	.pointSize(4)
	.count(10000)
	.color([.1, .4, .8])
	.uniform("start", "float", function() { return now; })
	.uniform("now", "float", function() { return Date.now(); })
	.attribute("velocity", 3, function(gl, count) {
		return pasy.randomSet(count, vec3, 0.05);
	})
	.vertex("float age = float(u_now - u_start);")
	.vertex("vec3 position = a_velocity * (0.5 + 0.5*abs(sin(age*0.001)));");

scene.add(ps);
