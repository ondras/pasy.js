var scene = new pasy.Scene(document.body);

var ps = scene.particleSet();
var now = Date.now();
ps
	.pointSize(10)
	.count(10000)
	.color([.1, .4, .8])
	.uniform("gravity", "vec3", function() { return [0, -1, 0]; })
	.uniform("life", "int", function() { return 3; })
	.uniform("start", "int", function() { return now; })
	.uniform("now", "int", function() { return Date.now(); })
	.attribute("index", 1, function(gl, count) {
		var data = [];
		for (var i=0;i<count;i++) { data.push(i); }
		return Float32Array(data);
	})
	.vertex("float theta = 0.25;")
	.vertex("float phi = a_index;")
	.vertex("float z = sin(theta) * cos(phi);")
	.vertex("float x = sin(theta) * sin(phi);")
	.vertex("float y = cos(theta);")
	.vertex("float age = (float(u_now - u_start) + a_index) * 0.0005;")
	.vertex("age = mod(age, float(u_life));")
	.vertex("vec3 position = 1.5 * age * vec3(x, y-0.3, z) + 0.5 * u_gravity * age * age;");

scene.add(ps);
