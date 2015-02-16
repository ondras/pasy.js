var scene = new pasy.Scene(document.body);
scene
	.distance(3);

var ps = scene.particleSet();
var now = Date.now();
ps
	.pointSize(12)
	.count(10000)
	.color([.1, .4, .8])
	.uniform("gravity", "vec3", function() { return [0, -1, 0]; })
	.uniform("life", "float", function() { return 3; })
	.uniform("time", "float", function() { return (Date.now()-now)/1000; })
	.attribute("random", 3, function(gl, count) {
		var data = [];
		for (var i=0;i<count;i++) {
			data.push(Math.random());
			data.push(Math.random());
			data.push(Math.random());
		}
		return new Float32Array(data);
	})
	.vertex("float theta = 0.2 + a_random[0]/5.0;")
	.vertex("float phi = a_random[1]*6.28;")
	.vertex("float z = sin(theta) * cos(phi);")
	.vertex("float x = sin(theta) * sin(phi);")
	.vertex("float y = cos(theta);")
	.vertex("float age = mod(u_time + a_random[2]*u_life, u_life);")
	.vertex("vec3 position = age * vec3(x, y, z) + 0.5 * u_gravity * age * age;");

scene.add(ps);
