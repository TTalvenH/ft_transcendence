import { GameStates } from "./pong/pong.js";

const routes = {
	"/": uiHandler,
	"/pong/": pongHandler,
	"/login/": loginHandler,
	"/register/": registerHandler,
};

async function uiHandler() {
    const html = await fetch("/ui").then((data) => data.text());
	document.getElementById('root').insertAdjacentHTML('beforeend', html);
}

async function loginHandler() {
    const html = await fetch("/users/login.html").then((data) => data.text());
	console.log(html);
	document.getElementById('root').insertAdjacentHTML('beforeend', html);
}

async function registerHandler() {
    const html = await fetch("/users/register.html").then((data) => data.text());
	console.log(html);
	document.getElementById('root').insertAdjacentHTML('beforeend', html);
}

async function pongHandler() {
    const html = await fetch("/pong/").then((data) => data.text());
	document.getElementById('sidePanel').style.display = 'none'; // Using display
	document.getElementById('sidePanel').style.visibility = 'hidden';
	window.pong.gameGlobals.gameState = GameStates.PLAYING;
}

async function handleLocation() {
	const path = window.location.pathname;
	console.log(path);
	const handler = routes[path] || routes["/404"];
	await handler();
}

window.route = (event) => {
	event.preventDefault();
	window.history.pushState({}, "", event.currentTarget.href);
	handleLocation();
};

window.pong.gameLoop();
window.onpopstate = handleLocation;
handleLocation();
