import {Pong} from './pong/pong.js'

const route = (event) => {
	event = event || window.event;
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	handleLocation();
	console.log("testi");
	console.log("123");
	// const pong = new Pong();

	// pong.gameLoop();
};

const routes = {
	404: "/404",
	"/": "/home.html",
	"/login": "/login.html"
};

const handleLocation = async () => {
	const path = window.location.pathname;
	const route = routes[path] || routes[404];
	const html = await fetch(route).then((data) => data.text());
	document.getElementById("main-page").innerHTML = html;
};

console.log('jjjjjjj');

window.onpopstate = handleLocation;
window.route = route;

console.log('WWWWWWWW');

handleLocation();

console.log('aaaaSSSSAA');

const pong = new Pong();

pong.gameLoop();

