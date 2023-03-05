import Segment from './Segment.js';

const SPACE_X = 200;
const SPACE_Y = 200;
const SHIFT_COUNTDOWN = 500;

const BODY_PARTS = [
	['chest', 'core', 20, 0, [0, 0]],
	['belly', 'chest', 30, 0, [-10, 10]],
	['legAThigh', 'belly', 40, -20, [-100, 70]],
	['legAShin', 'legAThigh', 40, 0, [-1, 160]],
	['legAFoot', 'legAShin', 12, -120, [-120, -20]],
	['legBThigh', 'belly', 40, 20, [-100, 70]],
	['legBShin', 'legBThigh', 40, 0, [-1, 160]],
	['legBFoot', 'legBShin', 12, -120, [-120, -20]],
	['neck', 'core', 8, 190, [170, 260]],
	['head', 'neck', 30, 10, [-10, 10], 'circle'],
	['armABicep', 'core', 34, -20, [-90, 90]],
	['armAForearm', 'armABicep', 34, -20, [-90, 1]],
	['armAHand', 'armAForearm', 3, 5, [-5, 5], 'circle'],
	['armBBicep', 'core', 34, 20, [-90, 90]],
	['armBForearm', 'armBBicep', 34, -20, [-90, 1]],
	['armBHand', 'armBForearm', 3, -5, [-5, 5], 'circle'],
];

class HumanAnimation {
	constructor() {
		this.core = new Segment({
			x: SPACE_X * 0.5, y: SPACE_Y * 0.25, length: 1, degrees: 90,
		});
		BODY_PARTS.forEach((partArr) => {
			const [name, parentName, length, degrees, degreeClamps] = partArr;
			this[name] = new Segment({
				parent: this[parentName], length, degrees, degreeClamps,
			});
		});
		// Locomotion vars
		this.shift = {
			countdown: SHIFT_COUNTDOWN,
			direction: 1,
		};
	}

	static getSegmentShape(segment, shape = 'line') {
		segment.calc();
		if (shape === 'circle') {
			const center = segment.getCenter();
			return {
				cx: center.x,
				cy: center.y,
				r: segment.getRadius(),
				shape,
			};
		}
		return {
			x1: segment.x,
			y1: segment.y,
			x2: segment.endX,
			y2: segment.endY,
			shape: shape || 'line',
		};
	}

	getBodyShapes() {
		return BODY_PARTS.map((partArr) => {
			const [name, parentName, length, degrees, degreeClamps, shape] = partArr;
			return HumanAnimation.getSegmentShape(this[name], shape);
		});
	}

	run(t) { // time in ms, e.g. ~50
		this.shift.countdown -= t;
		if (this.shift.countdown <= 0) {
			this.shift.direction *= -1;
			this.shift.countdown = SHIFT_COUNTDOWN;
		}
		const getAngle = (m) => m * t * this.shift.direction;
		const hipAngle = getAngle(0.0025);
		this.legAThigh.rotate(hipAngle, 1);
		this.legBThigh.rotate(hipAngle * -1, 1);
		this.belly.rotate(getAngle(0.0002), 0);
		this.armABicep.rotate(hipAngle, 1);
		this.armBBicep.rotate(hipAngle * -1, 1);
		this.core.y += getAngle(0.01);
		this.core.x += getAngle(0.001);
		// this.neck.rotate(getAngle(0.0001) * -1, 1);
	}

	stop(t) {
		BODY_PARTS.forEach((partArr) => {
			const [name, parentName, length, degrees, degreeClamps] = partArr;
			this[name].setAngleDegrees(degrees);
		});
	}
}

export default HumanAnimation;
