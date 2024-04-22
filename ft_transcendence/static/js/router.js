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
    "/login": "api/data/login.html",
	"/pong123": "/pong/api/pong.html"
};

const handleLocation = async () => {
	const path = window.location.pathname;
	const route = routes[path] || routes[404];
	console.log(route);
	const html = await fetch(route).then((data) => data.text());
	console.log(path);
	if (path === '/pong123')
		startPongGame()
	else
		document.getElementById("main-page").innerHTML = html;
	
	// Add event listener when the page is loaded
	addEventListenerToPlayButton();

};

const addEventListenerToPlayButton = () => {
    const playButton = document.getElementById("playButton");
    playButton.addEventListener("click", startPongGame);
};

const startPongGame = () => {
	document.getElementById("main-page").innerHTML = ""; //tyhjennetää cardi, tämä on purkkakikka
    const pongGame = new Pong();
	pongGame.gameLoop();
};

window.onpopstate = handleLocation;
window.route = route;
handleLocation();
