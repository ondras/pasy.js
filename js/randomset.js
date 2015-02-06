pasy.randomSet = function(count, type, jitter) {
	var tmp = type.create();
	var data = [];
	
	for (var i=0; i<count; i++) {
		var scale = 1 + (Math.random()-0.5)*jitter;
		type.random(tmp, scale);
		data.push.apply(data, tmp);
	}

	return new Float32Array(data);
}