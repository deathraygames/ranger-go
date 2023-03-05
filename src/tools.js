function calcDistance(x1, y1, x2, y2) {
	const q = ((x2 - x1) ** 2) + ((y2 - y1) ** 2);
	if (q === 0) return 0;
	return Math.sqrt(q);
}

function round(n, decimalPlaces = 0, mathMethod = 'round') {
	if (decimalPlaces < 1) return Math.round(n);
	const m = 10 ** Math.round(decimalPlaces);
	return Math[mathMethod](n * m) / m;
}

function getPseudoRandom(n) {
	// http://stackoverflow.com/a/19303725/1766230
	const x = Math.sin(n) * 10000;
	return x - Math.floor(x);
}

function polarToCartesian(r = 1, theta = 0, returnAsWhat = Array) {
	const arr = [
		r * Math.cos(theta),
		r * Math.sin(theta),
	];
	if (returnAsWhat === Object) return { x: arr[0], y: arr[1] };
	if (returnAsWhat === Array) return arr;
	return arr;
}

const PI_DIV_180 = Math.PI / 180;

function degreesToRadians(deg = 0) {
	return deg * PI_DIV_180;
}

export {
	calcDistance,
	degreesToRadians,
	getPseudoRandom,
	polarToCartesian,
	round,
};
