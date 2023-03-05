const ALL_ATTR = [
	'x', 'y', 'x1', 'y1', 'x2', 'y2',
	'cx', 'cy', 'r', 'rx', 'ry',
	'fill',
	'stroke',
	'strokeWidth',
];

export default {
	props: {
		attributes: Object,
	},
	watch: {
		attributes(newAttr) {
			this.setAttributeData(this, newAttr);
		},
	},
	data() {
		const dataObj = {};
		this.setAttributeData(dataObj, this.attributes);
		return {
			tag: this.attributes.shape || this.attributes.tag || 'line',
			...dataObj,
			// more?
		};
	},
	methods: {
		/** Mutates `obj` to assign attributes */
		setAttributeData(obj = this, attr = {}) {
			ALL_ATTR.forEach((a) => {
				obj[a] = attr[a] || null; // eslint-disable-line no-param-reassign
			});
		},
	},
	template: (
		`<component :is="tag"
			:x="x"
			:y="y"
			:x1="x1"
			:y1="y1"
			:x2="x2"
			:y2="y2"
			:cx="cx"
			:cy="cy"
			:r="r"
			:rx="rx"
			:ry="ry"
			:fill="fill"
			:stroke="stroke"
			:stroke-width="strokeWidth"></component>`
	),
};
