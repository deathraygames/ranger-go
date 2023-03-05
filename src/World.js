/* eslint-disable no-plusplus */
import { getPseudoRandom, calcDistance, round } from './tools.js';

const SQUARE_SIZE = 500;
// How many hours before we rotate to a new dateSeed
const SEED_ROTATION_HOURS = 12; // use a number between 0.3 - 48
const JOURNEY_ORBS_PER_METERS = 0.06; // 0.02;

class World {
	constructor(dateParam) {
		this.date = dateParam || (new Date());
		this.dateSeed = World.getDateSeed(this.date);
	}

	static getDateNumber(date) {
		// Get a date number that is fixed for a number of hours
		const year = date.getFullYear();
		const m = date.getMonth();
		const day = date.getDate();
		const hour = date.getHours(); // 24 hours
		// hour index based on 12 hours, so there will be a new date number every 12 hours
		const hourIndex = Math.round(hour / SEED_ROTATION_HOURS);
		const zeroPad = (n) => (((n < 10) ? '0' : '') + n);
		const str = [
			year,
			zeroPad(m),
			zeroPad(day),
			zeroPad(hourIndex),
		].join(''); // 202202080
		return Number(str) + 1;
	}

	static getDateSeed(date) {
		// First get a date number that is fixed for a number of hours
		const dateNumber = World.getDateNumber(date);
		// Feed date number inot pseudo-random generator to get deterministic seed
		return Math.round(getPseudoRandom(dateNumber) * 1000000);
	}

	makeLocation(seedStart, x1, y1) {
		let seed = seedStart;
		const x = round(x1 + getPseudoRandom(++seed) * SQUARE_SIZE, 3);
		const y = round(y1 + getPseudoRandom(++seed) * SQUARE_SIZE, 3);
		const dna = [];
		for (let i = 0; i < 20; i++) {
			dna.push(round(getPseudoRandom(++seed), 3));
		}
		// TODO: Generate other qualities?
		return {
			id: [this.dateSeed, seedStart].join('-'),
			seedStart,
			seedEnd: seed,
			x,
			y,
			event: {
				type: 'hostile',
				dna,
			},
		};
	}

	static pickJourneyOrbType(roll) {
		if (roll < 0.4) return { energy: -1 }; // 40%
		if (roll < 0.5) return { spirit: -1 }; // 10%
		if (roll < 0.6) return { health: -1 }; // 10%
		if (roll < 0.65) return { spirit: 1 }; // 5%
		if (roll < 0.7) return { health: 1 }; // 5%
		if (roll < 0.9) return { mystery: true }; // 20%
		return { card: true }; // 10%
	}

	static makeJourneyOrbs(x, y, location = {}) {
		let journeySeed = location.seedEnd;
		const dist = calcDistance(x, y, location.x, location.y);
		const orbNum = Math.ceil(dist * JOURNEY_ORBS_PER_METERS);
		const orbs = [];
		for (let i = 0; i < orbNum; i += 1) {
			const distancePercent = getPseudoRandom(++journeySeed);
			orbs.push({
				...World.pickJourneyOrbType(getPseudoRandom(++journeySeed)),
				distancePercent,
				distance: dist * distancePercent,
			});
		}
		return orbs;
	}

	getLocationsInSquare(centerX, centerY) {
		const halfSquareSize = SQUARE_SIZE / 2;
		// Top corner
		const x1 = centerX - halfSquareSize;
		const y1 = centerY - halfSquareSize;
		// const x2 = x1 + SQUARE_SIZE;
		// const y2 = y1 + SQUARE_SIZE;
		const locations = [];
		let iterativeSeed = this.dateSeed;
		for (let i = 0; i < 10; i += 1) {
			const location = this.makeLocation(iterativeSeed, x1, y1);
			locations.push(location);
			iterativeSeed = location.seedEnd + 1;
		}
		console.log(locations);
		return locations;
	}

	// TODO: Not used?
	static findClosestLocation(x, y, locations = []) {
		let closestLocation;
		let closestDistance = Infinity;
		locations.forEach((location) => {
			const dist = calcDistance(location.x, location.y, x, y);
			if (dist < closestDistance) {
				closestLocation = location;
				closestDistance = dist;
			}
		});
		return closestLocation;
	}
}

export default World;
