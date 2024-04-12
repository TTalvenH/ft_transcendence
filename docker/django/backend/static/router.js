import {Pong} from '/Users/ekoljone/Desktop/ft_transcendence/srcs/pong'

const route = (event) => {
	event = event || window.event;
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	handleLocation();
	console.log("testi");
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

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
