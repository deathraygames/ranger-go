import { calcDistance } from './tools.js';

const MAX_VISITED = 20;
const INITIAL_STATE_VALUE = 10;

class Ranger {
	constructor() {
		// Lebanon Kansas, the grographical center of the contiguous USA
		// https://en.wikipedia.org/wiki/Geographic_center_of_the_United_States#Marker
		// Latitude and Longitude are in degree, minute, second format and will need
		// converting to decimal
		// this.homeLAT = [39, 50, 0];
		// this.homeLONG = [-98, 35, 0];
		// "Home" is where your base of operations is
		this.homeX = 0;
		this.homeY = 0;
		// "Start" is where the current journey is beginning from - could be home or the last stop
		this.startX = 0;
		this.startY = 0;
		// Destination is where the current journey is leading to
		this.destination = { id: null, event: null, x: 1, y: 1 };
		// Distance from start to destination - the progress so far
		this.distance = 0; // in meters
		// Stats
		this.baseSpeed = 1; // m/s -- 1.2-1.4 = normal gait speed, 9.5-12.5 = max running speed
		// Currencies
		this.spirit = INITIAL_STATE_VALUE;
		this.energy = INITIAL_STATE_VALUE;
		this.health = INITIAL_STATE_VALUE;
		// These fill up and once past a threhold, will cause a penalty
		this.effort = 0;
		// Tracking
		this.visited = []; // array of location ids
		this.bestRange = 0;
		// Cache object for storing values that don't change too often
		this.cache = {
			destinationDistance: Infinity,
			//
		};
	}

	getCoordinates() {
		const traveledPercent = this.getDistancePercent();
		const percentLeft = 1 - traveledPercent;
		const x = (percentLeft * this.startX) + (traveledPercent * this.destination.x);
		const y = (percentLeft * this.startY) + (traveledPercent * this.destination.y);
		// const slope = (this.destination.y - this.startY) / (this.destination.y - this.startX);
		return { x, y };
	}

	getCoordinatesArray() {
		const { x, y } = this.getCoordinates();
		return [x, y];
	}

	getRangeFromHome() {
		const { x, y } = this.getCoordinates();
		return calcDistance(x, y, this.homeX, this.homeY);
	}

	getSpeed() {
		const m = (this.spirit > 0) ? 1 : 0;
		const e = (this.energy > 0) ? 1 : 0;
		const h = (this.health > 0) ? 1 : 0;
		const baseHealthySpeed = this.baseSpeed * ((m + e + h) / 3);
		// TODO: Add multipliers based on gear
		return baseHealthySpeed || 0.01;
	}

	calcDestinationDistance() {
		return calcDistance(this.startX, this.startY, this.destination.x, this.destination.y);
	}

	getDestinationDistance() {
		if (this.cache.destinationDistance) return this.cache.destinationDistance;
		return this.calcDestinationDistance();
	}

	getDistancePercent() {
		const destDist = this.getDestinationDistance();
		if (destDist === 0) return 0;
		return this.distance / destDist;
	}

	changeStat(obj = {}) {
		if (obj.energy) this.energy += obj.energy;
		if (this.energy < 0) {
			this.spirit += this.energy;
			this.energy = 0;
		}
		if (obj.spirit) this.spirit += obj.spirit;
		if (this.spirit < 0) {
			this.health += this.spirit;
			this.spirit = 0;
		}
		if (obj.health) this.health += obj.health;
		if (this.health < 0) {
			this.health = 0;
		}
	}

	setNewDestination(location = {}) {
		const [currentX, currentY] = this.getCoordinatesArray();
		this.startX = currentX;
		this.startY = currentY;
		const { id, x, y, event } = location;
		this.destination = { id, x, y, event: { ...event } };
		this.distance = 0;
		this.cache.destinationDistance = this.calcDestinationDistance();
	}

	setHomeDestination() {
		this.setNewDestination({
			id: null,
			x: this.homeX,
			y: this.homeY,
			event: { type: 'home' },
		});
	}

	advanceDistance(t = 0) { // time in ms
		const msSpeed = this.getSpeed() / 1000;
		const metersTraveled = msSpeed * t;
		this.distance += metersTraveled;
		// Don't go past the destination
		const destDist = this.getDestinationDistance();
		if (this.distance > destDist) this.distance = destDist;
		return this.distance;
	}

	trackVisited(locationId) {
		if (!locationId) return;
		this.visited.push(locationId);
		if (this.visited.length > MAX_VISITED) this.visited.shift();
		console.log('visited', this.visited);
	}

	findNextLocation(locations = []) {
		const rangerRange = this.getRangeFromHome();
		const { x, y } = this.getCoordinates();
		let closestLocation;
		let closestDistance = Infinity;
		locations.forEach((location) => {
			const range = calcDistance(location.x, location.y, this.homeX, this.homeY);
			// Don't consider locations that are not farther away
			// rangers like to range!
			if (range < rangerRange) return;
			// Don't return to a place already visited
			if (this.visited.find((v) => (v === location.id))) return;
			// Now find the nearest one
			const dist = calcDistance(location.x, location.y, x, y);
			if (dist < closestDistance) {
				closestLocation = location;
				closestDistance = dist;
			}
		});
		return closestLocation;
	}
}

export default Ranger;
