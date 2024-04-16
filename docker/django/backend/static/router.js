import {Pong} from './pong/pong.js'


const route = (event) => {
	event = event || window.event;
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	handleLocation();
};

const routes = {
	404: "/404",
	"/": "api/data/home.html",
	"/login": "api/data/login.html"
};

const handleLocation = async () => {
	const path = window.location.pathname;
	const route = routes[path] || routes[404];
	const html = await fetch(route).then((data) => data.text());
	document.getElementById("main-page").innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;
handleLocation();

const startGame = () => {
    // Start your Pong game
    const pongGame = new Pong(); // Assuming Pong() is the constructor for your Pong game
    pongGame.gameLoop(); // Call the start method of your Pong game
};

document.getElementById('startButton').addEventListener('click', startGame);