/* pointsize, count, depth, life */

var scene = new pasy.Scene(document.body);
scene
	.distance(0.1)

var ps = scene.particleSet();
var now = Date.now();
ps
	.pointSize(1, 50)
	.count(100000)
	.color(function(gl, count) {
		return pasy.randomSet(count, vec3);
	})
	.uniform("life", "float", function() { return 15; })
	.uniform("depth", "float", function() { return 40; })
	.uniform("time", "float", function() { return (Date.now()-now)/1000; })
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
	min: 1e2,
	max: 1e6,
	scale: "log10",
	value: 1e4,
	round: 1e2
}, function(x) { ps.count(x); });
