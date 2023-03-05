import World from './World.js';
import Ranger from './Ranger.js';
import { round } from './tools.js';
import svgShapeComponent from './svg-shape.js';
import HumanAnimation from './HumanAnimation.js';

const DECISION_MAX_SECONDS = 40;
const BASE_TIME_MULTIPLIER = 5;
const HOME_TIME_MULTIPLIER = 10;

export default {
	// props: {},
	mounted() {
		this.ranger = new Ranger();
		this.setNextDestination();
		this.startClock();
	},
	data() {
		const human = new HumanAnimation();
		console.log(human);
		return {
			nearbyLocations: [],
			ranger: new Ranger(),
			event: null,
			orbs: null,
			timer: 0,
			time: 0,
			tickTime: 40,
			tickTotal: 0,
			isRunning: false,
			timeMultiplier: BASE_TIME_MULTIPLIER,
			human,
		};
	},
	computed: {
		// Stats
		speed() { return (this.ranger) ? round(this.ranger.getSpeed(), 2) : 0; },
		spirit() { return (this.ranger) ? Math.ceil(this.ranger.spirit) : 0; },
		energy() { return (this.ranger) ? Math.ceil(this.ranger.energy) : 0; },
		health() { return (this.ranger) ? Math.ceil(this.ranger.health) : 0; },
		// Animation
		humanShapes() {
			return this.human.getBodyShapes();
		},
		// Various
		range() {
			return round(this.ranger.getRangeFromHome(), 1);
		},
		destinationDistance() {
			return (this.ranger) ? round(this.ranger.getDestinationDistance(), 1) : Infinity;
		},
		distance() {
			return round(this.ranger.distance, 1);
		},
		isAtDestination() {
			return this.distance === this.destinationDistance;
		},
		journeyBarStyle() {
			return { width: `${round(this.ranger.getDistancePercent() * 100, 3, 'floor')}%` };
		},
		isStopped() {
			return !this.isRunning && !this.event;
		},
		decisionCountdown() {
			if (!this.event) return 0;
			return round(this.event.decisionCountdown / 1000, 1);
		},
		actions() {
			// Different pseudo-states for the game are:
			// - isRunning --> Going to next destination
			// - event --> stopping to do an event
			// - stopped --> doing nothing, making decisions
			// - combat --> fighting something

			// const stopAction = () => { this.isRunning = false; };
			// const returnHomeAction = () => this.returnHome();
			// const continueAction = () => this.continue();
			if (this.event) {
				if (this.event.type === 'home') {
					return [null, null, null, { text: 'Continue Journey', action: () => this.continue() }];
				}
				const isHostile = (this.event.type === 'hostile');
				const fleeText = (isHostile) ? 'Flee to Home' : 'Return Home';
				const abortText = (isHostile) ? 'Sneak Past' : 'Continue Journey';
				return [
					{ text: fleeText, action: () => this.returnHome() },
					{ text: 'Approach Peacefully', action: () => { this.event.type = 'combat'; } },
					{ text: 'Fight!', action: () => { this.event.type = 'combat'; } },
					{ text: abortText, action: () => this.continue(), isDefault: true },
				];
			}
			if (this.isRunning) {
				return [
					{ text: 'Stop', action: () => { this.isRunning = false; } },
					null,
					null,
					null,
				];
			}
			// Default: Stopped
			return [
				{ text: 'Return Home', action: () => this.returnHome() },
				null,
				null,
				{ text: 'Continue Journey', action: () => this.continue() },
			];
		},
	},
	methods: {
		getWorld() {
			return new World();
		},
		startClock() {
			this.time = window.performance.now();
			this.tickClock();
			// return this.time;
		},
		stopClock() {
			window.clearTimeout(this.timer);
			// return window.performance.now();
		},
		tickClock() {
			const now = window.performance.now();
			const t = now - this.time;
			this.tickTotal += t;
			if (this.tickTotal > 1000000) this.tickTotal = 0;
			this.time = now;
			this.advance(t * this.timeMultiplier);
			this.timer = window.setTimeout(() => this.tickClock(), this.tickTime);
			// return t;
		},
		returnHome() {
			console.log('return home');
			if (this.event) {
				// TODO: chance of not being able to flee?
			}
			this.event = null;
			this.ranger.setHomeDestination();
			this.orbs = null;
			this.timeMultiplier = HOME_TIME_MULTIPLIER;
			this.isRunning = true;
		},
		setNextDestination() {
			const { x, y } = this.ranger.getCoordinates();
			const world = this.getWorld();
			this.nearbyLocations = world.getLocationsInSquare(x, y);
			const nextLoc = this.ranger.findNextLocation(this.nearbyLocations);
			console.log('nearby', this.nearbyLocations, 'next', nextLoc);
			this.ranger.setNewDestination(nextLoc);
			this.orbs = World.makeJourneyOrbs(x, y, nextLoc);
		},
		continue() {
			if (this.event) {
				// TODO: chance of not being able to flee?
			}
			this.event = null;
			this.timeMultiplier = BASE_TIME_MULTIPLIER;
			if (this.isAtDestination) {
				this.setNextDestination();
			}
			this.isRunning = true;
		},
		setupEvent(event = {}) {
			if (!event) {
				this.event = null;
				return;
			}
			const { type, dna } = event;
			const decisionCountdown = (dna) ? dna[0] * DECISION_MAX_SECONDS * 1000 : Infinity;
			this.event = {
				type,
				dna,
				decisionCountdown,
			};
		},
		doDefaultAction() {
			const defaultAction = this.actions.find((action) => action.isDefault) || this.actions[3];
			defaultAction.action();
		},
		checkOrbs() {
			if (!this.orbs) return;
			// Get orbs that haven't been triggered yet and that we've passed
			const orbsToTrigger = this.orbs.filter((orb) => (
				!orb.triggered && orb.distance < this.distance
			));
			if (!orbsToTrigger) return;
			orbsToTrigger.forEach((orb) => {
				orb.triggered = true;
				console.log('ORB', orb);
				this.ranger.changeStat(orb);
			});
		},
		advance(t) {
			// console.log(t);
			if (this.isRunning) {
				this.human.run(t);
				this.ranger.advanceDistance(t);
				if (this.isAtDestination) {
					console.log('At destination. stopping and tracking as visited');
					this.timeMultiplier = 1;
					this.isRunning = false;
					this.orbs = null;
					this.ranger.trackVisited(this.ranger.destination.id);
					this.setupEvent(this.ranger.destination.event);
				} else {
					this.ranger.bestRange = Math.floor(Math.max(this.ranger.bestRange, this.range));
					this.checkOrbs();
				}
			} else {
				this.human.stop(t);
			}
			if (this.event) {
				if (this.event.decisionCountdown) this.event.decisionCountdown -= t;
				if (this.event.decisionCountdown < 0) this.event.decisionCountdown = 0;
				if (!this.event.decisionCountdown) {
					this.doDefaultAction();
				}
			}
		},
		getOrbStyle(orb) {
			return {
				left: `calc(${round(orb.distancePercent * 100, 3)}% - .5em)`,
				transform: (orb.triggered) ? 'scale(0.6)' : '',
			};
		},
	},
	components: {
		'svg-shape': svgShapeComponent,
	},
	template: (
		`<article class="page">
			<div class="scene">
				<section class="scene-gfx">
					<svg class="scene-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 200">
						<g class="everything-g">
							<g class="ranger-g" fill="white" stroke="white" stroke-width="5">
								<svg-shape :attributes="shapeObj" v-for="shapeObj in humanShapes"></svg-shape>
							</g>
						</g>
					</svg>
				</section>
				<section class="scene-overlay">
					<div>ENERGY: {{energy}}</div>
					<div>SPIRIT: {{spirit}}</div>
					<div>HEALTH: {{health}}</div>
				</section>
			</div>
			<section class="progress">
				<div v-if="event">
					EVENT
					<div>{{decisionCountdown}}</div>
				</div>
				<div class="journey-progress" v-if="isRunning || isStopped">
					<div>
						<div class="journey-distance">
							<div class="journey-distance-value">{{distance}}</div>
							<div class="journey-destination-distance-value">{{destinationDistance}}</div>
						</div>
						<div class="journey-bar-container">
							<ul class="journey-orbs">
								<div v-for="orb in orbs"
									:title="JSON.stringify(orb)"
									class="journey-orb"
									:style="getOrbStyle(orb)">
									?
								</div>
							</ul>
							<div class="journey-bar" :style="journeyBarStyle"></div>
						</div>
					</div>
					<div class="journey-speed">SPD: {{speed}} m/s <span v-if="timeMultiplier !== 1">x{{timeMultiplier}}</span></div>
					<div class="journey-range">RANGE: {{range}} <span v-if="range < ranger.bestRange">/ {{ranger.bestRange}}</span> m from home</div>
				</div>
			</section>
			<section class="controls">
				<ol class="action-list">
					<li v-for="action in actions">
						<div v-if="!action" class="action-placeholder"></div>
						<button type="button" v-if="action" class="action" @click="action.action">
							{{action.text}}
						</button>
					</li>
				</ol>
			</section>
		</article>`
	),
};
