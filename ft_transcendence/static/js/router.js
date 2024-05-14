import { GameStates } from "./pong/pong.js";

//variables where we save the html content when it is first fetched
let loginFormHTML;
let registerFormHTML;

const routes = {
	"/": homeHandler,
	"/pong": pongHandler,
	"/login": loginHandler,
	"/register": registerHandler,
	"/profile": profileHandler,
	"/edit-profile": editProfileHandler,
};

async function homeHandler() {
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
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

	const userProfileData = await fetch('/users/get-user-profile/46/', {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + localStorage.getItem('token'),
		},
	});
	console.log(userProfileData);
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
