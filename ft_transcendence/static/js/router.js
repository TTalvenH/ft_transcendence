import { GameStates } from "./pong/pong.js";

const routes = {
	"/": uiHandler,
	"/pong": pongHandler,
	"/login": loginHandler,
	"/register": registerHandler,
};

async function uiHandler() {
    const html = await fetch("/ui").then((data) => data.text());
	document.getElementById('root').insertAdjacentHTML('beforeend', html);
}

// async function loginHandler() {
//     const html = await fetch("/users/login.html").then((data) => data.text());
// 	console.log(html);
// 	document.getElementById('root').insertAdjacentHTML('beforeend', html);
// }

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
                alert('Login successful!');
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

// async function registerHandler() {
//     const html = await fetch("/users/register.html").then((data) => data.text());
// 	document.getElementById('root').insertAdjacentHTML('beforeend', html);
// }

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


async function pongHandler() {
    const html = await fetch("/pong/").then((data) => data.text());
	document.getElementById('sidePanel').style.display = 'none'; // Using display
	document.getElementById('sidePanel').style.visibility = 'hidden';
	window.pong.gameGlobals.gameState = GameStates.PLAYING;
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


window.pong.gameLoop();
window.onpopstate = handleLocation;
handleLocation();
