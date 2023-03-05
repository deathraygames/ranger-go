// This just makes the vue app and mounts it

// import { createApp } from '../libs/vue.esm-browser.prod.js';
import { createApp } from '../libs/vue.esm-browser.js';
import game from './game.js';

const options = {
	components: { game },
	template: '<game></game>',
};
const app = createApp(options);
app.mount('#main');

export default app;
