
import { handleSidePanel } from "./utils.js";
import { currentUser } from "./user.js";

class Router {
	constructor() {
		this.routes = [];
		this.currentPath = '';
		this.currenSearchParams = '';
	}
	set(path, handler) {
		if (!path || !handler) throw new Error('path and handler are required');
		if (typeof path !== 'string') throw new TypeError('path must be a string');
		if (typeof handler !== 'function') throw new TypeError('handler must be a function');
		this.routes.forEach(route => {
			if (route.path === path) throw new Error(`Route with path ${path} already exists`);
		});
		const route = {
			path,
			handler
		};
		this.routes.push(route);
	}

	async handleLocation() {
		handleSidePanel();
		this.currentPath = window.location.pathname;
		this.currenSearchParams = window.location.search;
		currentUser.refreshToken();
		const route = this.routes.find(route => {
			const regEx = new RegExp(`^${route.path}$`);
			return this.currentPath.match(regEx);
		});
		if (route) {
			let req = { path: this.currentPath };
			return route.handler(this, req);
		} else {
			history.pushState({}, "", "/");
		}
	}
}

export const router = new Router();