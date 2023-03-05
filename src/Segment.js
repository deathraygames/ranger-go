import { polarToCartesian, degreesToRadians } from './tools.js';

// Inspired by "The Coding Train" https://www.youtube.com/watch?v=xXjRlEr7AGk

class Segment {
	constructor(options = {}) {
		const {
			parent,
			x = 0,
			y = 0,
			length = 1,
			angle, // optional angle in radians
			degrees, // optional angle in degrees
			children = [],
			angleClamps, // optional array of two angles in radians
			degreeClamps, // optional array of two angles in degrees
		} = options;
		// Setup children (if provided)
		this.children = new Set();
		children.forEach((child) => this.children.add(child));
		// Setup start point and parent (if provided)
		this.x = x;
		this.y = y;
		this.parent = parent || null;
		if (this.parent) {
			Segment.connectParent(this, this.parent);
			this.calcStartPoint();
		}
		this.length = length;
		// Setup angles and clamps
		const defaultAngle = degreesToRadians(degrees || 0);
		this.angle = (typeof angle === 'number') ? angle : defaultAngle;
		const angleClampsDefault = [];
		if (degreeClamps) {
			if (typeof degreeClamps[0] === 'number') angleClampsDefault[0] = degreesToRadians(degreeClamps[0]);
			if (typeof degreeClamps[1] === 'number') angleClampsDefault[1] = degreesToRadians(degreeClamps[1]);
		}
		this.angleClamps = angleClamps || angleClampsDefault;

		// Computed / Cached values
		this.endX = 0;
		this.endY = 0;
	}

	static connectParent(child, parent) {
		child.parent = parent; // eslint-disable-line no-param-reassign
		parent.children.add(child);
	}

	getRadius() {
		return this.length / 2;
	}

	getCenter() {
		return this.calcEndPoint(this.getRadius());
	}

	/** Get the angle of rotation taking into account the parents */
	getGlobalAngle() {
		return (this.parent) ? this.parent.getGlobalAngle() + this.angle : this.angle;
	}

	clampAngle(clampsParam) {
		const clamps = clampsParam || this.angleClamps;
		const [min, max] = clamps;
		if (typeof min === 'number') if (this.angle < min) this.angle = min;
		if (typeof max === 'number') if (this.angle > max) this.angle = max;
	}

	setAngle(radians) {
		this.angle = radians;
		this.clampAngle();
		this.calc();
	}

	setAngleDegrees(deg) {
		return this.setAngle(degreesToRadians(deg));
	}

	rotate(angleDelta = 0, childrenPercent = 0) {
		this.setAngle(this.angle + angleDelta);
		if (!childrenPercent) return;
		this.children.forEach((child) => {
			child.rotate(angleDelta * childrenPercent, childrenPercent);
		});
	}

	calc(direction = 0) {
		this.calcStartPoint();
		this.calcEndPoint();
		const forward = direction > 0;
		// const inverse = direction < 0;
		if (forward) {
			this.children.forEach((child) => {
				child.calc();
			});
		}
	}

	calcStartPoint() {
		if (this.parent) {
			const { x, y } = this.parent.getEndPoint();
			this.x = x;
			this.y = y;
		}
		return { x: this.x, y: this.y };
	}

	calcEndPoint(length = this.length) {
		const angle = this.getGlobalAngle();
		const [dx, dy] = polarToCartesian(length, angle, Array);
		this.endX = this.x + dx;
		this.endY = this.y + dy;
		return { x: this.endX, y: this.endY };
	}

	getEndPoint() {
		// TODO: Used cached values sometimes?
		return this.calcEndPoint();
	}
}

export default Segment;
