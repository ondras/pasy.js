var scene = new pasy.Scene(document.body);

var ps = scene.particleSet();

ps.attribute("velocity", {length:3}, function(gl, buffer, count) {
	var tmp3 = vec3.create();
	var velocity = [];
	
	for (var i=0; i<count; i++) {
		var diff = 1 + (Math.random()-0.5)*0.05;
		vec3.random(tmp3, diff);
		velocity.push(tmp3[0], tmp3[1], tmp3[2]);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(velocity), gl.STATIC_DRAW);
});

scene.add(ps);