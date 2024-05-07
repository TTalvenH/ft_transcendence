import { GameStates, Pong } from "./pong/pong.js";
import { pongStartHandler, pongMatchOverHandler } from "./routeHandlers/pongHandlers.js";

const gameOverData = {
	player1: {
		name: "",
		hitpoints: 0,
	},
	player2: {
		name: "",
		hitpoints: 0,
	},
	winner: "",
	matchTimeLength: 0,
	dateTime: 0,
};

export const gameOverEvent = new CustomEvent('endMatch', { detail: gameOverData });

const routes = {
	"/": uiHandler,
	"/pongStart": pongStartHandler,
	"/pongMatchOver": pongMatchOverHandler,
	"/login": loginHandler,
	"/register": registerHandler,
};

async function uiHandler() {
    const html = await fetch("/ui").then((data) => data.text());
	document.getElementById('root').insertAdjacentHTML('beforeend', html);
	const sidePanel = document.getElementById('sidePanel');
	sidePanel.addEventListener('click', async (event) => {
		if (event.target.id === 'startGameButton') {
			document.getElementById('sidePanel').style.visibility = 'hidden';
			const players = await fetch('/pong/startMatch').then((data) => data.json());
			pong.startGame(players);
		}
	});
	document.addEventListener('endMatch', async (event) =>{
		console.log(event.detail.gameOverData);
		console.log('Game over event triggered!');
		const response = await fetch('/pong/endMatch', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(event.detail.gameOverData)
		});
	});
}

async function loginHandler() {
    const html = await fetch("/users/login.html").then((data) => data.text());
    document.getElementById('root').insertAdjacentHTML('beforeend', html);

    // Add event listener to the registration form
    const registerForm = document.getElementById('loginForm');
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get form data
        let formData = new FormData(registerForm);
        
        try {
            // Send form data to the backend
            const response = await fetch('/users/login-user', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Registration successful
                const data = await response.json();
                pong.startGame(data);
                // Redirect to another page or handle the response as needed
            } else {
                // Registration failed
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error couldnt login', error);
            alert('An error occurred during registration. Please try again later.');
        }
    });
}

async function registerHandler() {
    const html = await fetch("/users/register.html").then((data) => data.text());
    document.getElementById('root').insertAdjacentHTML('beforeend', html);

    // Add event listener to the registration form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get form data
		const formData = new FormData(registerForm);
        try {
            // Send form data to the backend
            const response = await fetch('/users/create-user', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Registration successful
                alert('Registration successful!');
                // Redirect to another page or handle the response as needed
            } else {
                // Registration failed
                alert('Registration failed!');
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('An error occurred during registration. Please try again later.');
        }
    });
}

async function handleLocation() {
	const path = window.location.pathname;
	const handler = routes[path] || routes["/404"];
	await handler();
}

let currentRoute = "";

window.route = (event) => {
    event.preventDefault();
    const href = event.currentTarget.href;
    if (href !== currentRoute) { // Check if the new route is different from the current one
        currentRoute = href;
        window.history.pushState({}, "", currentRoute);
        handleLocation();
    }
};

const pong = new Pong();

pong.gameLoop();
window.onpopstate = handleLocation;
handleLocation();
