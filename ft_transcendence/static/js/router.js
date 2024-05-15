import { GameStates } from "./pong/pong.js";

//variables where we save the html content when it is first fetched
let loginFormHTML;
let registerFormHTML;

class User {
	constructor() {
		this.username = "";
		this.id = -1;
		this.accessToken = "";
		this.refreshToken = "";
		this.lastActive = -1;
	}
};

let currentUser = new User();

const routes = {
	"/": homeHandler,
	"/pong": pongHandler,
	"/login": loginHandler,
	"/register": registerHandler,
	"/profile": profileHandler,
	"/edit-profile": editProfileHandler,
	"/log-out": logOutHandler,
};

async function logOutHandler() {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	const response = await fetch("/users/log-out-view", {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	});
	if (response.ok) {
		localStorage.removeItem('currentUser');
		history.pushState({}, "", "/");
		homeHandler();
	} else {
		alert('Logout failed!');
	}
}

async function homeHandler() {
	const sidepanel = document.getElementById('sidePanel');
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	const sidePanelContent = await fetch("sidepanel.html").then((data) => data.text());
	sidepanel.innerHTML = sidePanelContent;
}



async function editProfileHandler() {
	const userContainer = document.getElementById('userContainer');
	const updateProfileHTML = await fetch("/users/update_profile.html").then((data) => data.text());	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', updateProfileHTML);
	const updateProfileForm = document.getElementById('updateProfileForm');
	updateProfileForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const formData = new FormData(updateProfileForm);
		const response = await fetch('/users/update-user', {
			method: 'PUT',
			body: formData
		});
		if (response.ok) {
			alert('Profile updated!');
		} else {
			alert('Profile update failed!');
		}
	});

	const input = document.getElementById('imageInput');
	const profileImage = document.getElementById('profileImage');
	input.addEventListener('change', async (event) => {
		var file = input.files[0];
		if (file) {
			var reader = new FileReader();
			reader.onload = function(e) {
				// Replace the image source with the selected image
				profileImage.src = e.target.result;
				profileImage.onload = function() {
					// Make sure the image is loaded before displaying it
					profileImage.style.display = 'block';
				}
			}
			reader.readAsDataURL(file);
		}
	});

	const checkBox = document.getElementById('flexSwitchCheckDefault');
	checkBox.addEventListener('change', (event) => {
		console.log('something happened 2')
		const passwordFields = document.querySelectorAll('.passwordField');
		if (event.target.checked) {
			passwordFields.forEach((passwordField) => {
				passwordField.style.display = 'block';
			});
		} else {
			passwordFields.forEach((passwordField) => {
				passwordField.style.display = 'none';
			});
		}
	});
}

async function profileHandler() {
	const userContainer = document.getElementById('userContainer');
	const profileHTML = await fetch("/users/profile.html").then((data) => data.text());
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', profileHTML);

	const userData = JSON.parse(localStorage.getItem('currentUser'));
	console.log(userData);
	const response = await fetch(`/users/get-user-profile/${userData.id}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	});
	if (response.ok) {
		const data = await response.json();
		console.log(data);
		const friendBodyEl = document.getElementById('friendsBody');
		data.friends.forEach((friend) => {
			const friendRow = document.createElement('tr');
			const friendName = document.createElement('td');
			const friendStatus = document.createElement('td');
			friendName.innerText = friend.username;
			friendStatus.innerText = '•';
			friendStatus.style.textAlign = 'center';
			if (friend.is_active) {
				friendStatus.style.color = 'green';
			} else {
				friendStatus.style.color = 'red';
			}
			friendRow.appendChild(friendName);
			friendRow.appendChild(friendStatus);
			friendBodyEl.appendChild(friendRow);
		});
	} else {
		alert('Failed to get user profile');
	}
}

async function loginHandler() {
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	if (!loginFormHTML)
		loginFormHTML = await fetch("/users/login.html").then((data) => data.text());
	userContainer.insertAdjacentHTML('beforeend', loginFormHTML);
    // Add event listener to the registration form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get form data
        const formData = new FormData(loginForm);
        
        try {
            // Send form data to the backend
            const response = await fetch('/users/login-user', {
				method: 'POST',
				body: formData
            });

            if (response.ok) {
				const data = await response.json();
				currentUser.username = data.user.username;
				currentUser.id = data.user.id;
				currentUser.accessToken = data.tokens.access;
				currentUser.refreshToken = data.tokens.refresh;
				currentUser.lastActive = data.user.last_active;
				console.log(currentUser);
				localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Registration successful
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
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	if (!registerFormHTML) // we only fetch once and then save it locally
		registerFormHTML = await fetch("/users/register.html").then((data) => data.text());
    userContainer.insertAdjacentHTML('beforeend', registerFormHTML);
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
	document.getElementById('ui').style.display = 'none'; // Using display
	document.getElementById('ui').style.visibility = 'hidden';
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
