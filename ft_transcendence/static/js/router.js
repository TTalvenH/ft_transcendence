import { GameStates } from "./pong/pong.js";

//variables where we save the html content when it is first fetched
let loginFormHTML;
let registerFormHTML;
let uiHTML;
let profileHTML;

const routes = {
	"/": uiHandler,
	"/pong": pongHandler,
	"/login": loginHandler,
	"/register": registerHandler,
	"/profile": profileHandler,
};

async function uiHandler() {
	if (!uiHTML)
		uiHTML = await fetch("/ui").then((data) => data.text());
	document.getElementById('ui').insertAdjacentHTML('beforeend', uiHTML);
}

async function profileHandler() {
	// const profileBox = document.getElementById('profileBox');
	// if (profileBox)
	// 	profileBox.remove();
	if (!profileHTML)
		profileHTML = await fetch("/users/profile.html").then((data) => data.text());
	document.getElementById('ui').insertAdjacentHTML('beforeend', profileHTML);
}


async function loginHandler() {
    const registerBox = document.getElementById('registerBox');
    if (registerBox) registerBox.remove();
    if (!loginFormHTML) {
        loginFormHTML = await fetch("/users/login.html").then((data) => data.text());
    }
    document.getElementById('ui').insertAdjacentHTML('beforeend', loginFormHTML);

    // Add event listener to the login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get form data
        let formData = new FormData(loginForm);

        try {
            // Send form data to the backend
            let response = await fetch('/users/login-user', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();

                // Check if 2FA is enabled for the user
                if (data.otp_required) {
                    // Display the OTP input field
                    loginFormHTML = await fetch("/users/qr_prompt.html").then((data) => data.text());
                    document.getElementById('ui').insertAdjacentHTML('beforeend', loginFormHTML);

                    // Add event listener for OTP form submission
                    const otpForm = document.getElementById('otpForm');
                    otpForm.addEventListener('submit', async (event) => {
                        event.preventDefault();

                        // Get OTP form data
                        let otpFormData = new FormData(otpForm);

                        // Send OTP form data to the backend
                        let otpResponse = await fetch('/users/validate-otp', {
                            method: 'POST',
                            body: otpFormData
                        });

                        if (otpResponse.ok) { // Correct response check
                            const result = await otpResponse.json();
                            alert('Login successful!');
                            // Redirect to another page or handle the response as needed
                        } else {
                            alert('Invalid OTP.');
                        }
                    });
                } else {
                    // Login successful without 2FA
                    alert('Login successful!');
                    // Redirect to another page or handle the response as needed
                }
            } else {
                // Login failed
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error during login', error);
            alert('An error occurred during login. Please try again later.');
        }
    });
}



// async function loginHandler() {
// 	const registerBox = document.getElementById('registerBox');
// 	if (registerBox)
// 		registerBox.remove();
// 	if (!loginFormHTML)
// 		loginFormHTML = await fetch("/users/login.html").then((data) => data.text());
//     document.getElementById('ui').insertAdjacentHTML('beforeend', loginFormHTML);
//     // Add event listener to the registration form
//     const loginForm = document.getElementById('loginForm');
//     loginForm.addEventListener('submit', async (event) => {
//         event.preventDefault(); // Prevent default form submission behavior

//         // Get form data
//         let formData = new FormData(loginForm);
        
//         try {
//             // Send form data to the backend
//             const response = await fetch('/users/login-user', {
//                 method: 'POST',
//                 body: formData
//             });

//             if (response.ok) {
//                 // Registration successful
//                 alert('Login successful!');
//                 // Redirect to another page or handle the response as needed
//             } else {
//                 // Registration failed
//                 alert('Login failed!');
//             }
//         } catch (error) {
//             console.error('Error couldnt login', error);
//             alert('An error occurred during registration. Please try again later.');
//         }
//     });
// }


async function registerHandler() {
	const loginBox = document.getElementById('loginBox');
	if (loginBox) {
		loginBox.remove();
	}

	if (!registerFormHTML) {
		registerFormHTML = await fetch("/users/register.html").then(response => {
			if (!response.ok) throw new Error('Failed to fetch registration form');
			return response.text();
		});
	}

	document.getElementById('ui').insertAdjacentHTML('beforeend', registerFormHTML);

	const registerForm = document.getElementById('registerForm');
	if (registerForm) {
		registerForm.addEventListener('submit', async (event) => {
			event.preventDefault(); // Prevent default form submission behavior

			const formData = new FormData(registerForm);

			try {
				const response = await fetch('/users/create-user', {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					const result = await response.json();

					if (result.otp && result.otp.html) {
						const qrHTML = result.otp.html;
						document.getElementById('ui').insertAdjacentHTML('beforeend', qrHTML);
					} else {
						alert('Registration successful');
					}
				} else {
					const errorData = await response.json();
					alert(`Registration failed: ${errorData.detail}`);
				}
			} catch (error) {
				console.error('Error registering user:', error);
				alert('An error occurred during registration. Please try again later.');
			}
		});
	} else {
		console.error('Register form not found');
	}
}

// async function test() {
// 	const data = {
// 		username: 'pena123',
// 		email: 'qweds@dk.ff',
// 		password: 'Testisalis1234@',
// 		confirm_password: 'Testisalis1234@',
// 		enable_otp: 'true'
// 	};

// 	try {
// 		const response = await fetch('http://127.0.0.1:8000/users/create-user', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify(data)
// 		});

// 		if (response.ok) {
// 			const result = await response.json();
// 			const html = result.otp.html;
// 			document.getElementById('userContainer').insertAdjacentHTML('beforeend', html);
// 		} else {
// 			console.error('Error:', response.statusText);
// 		}
// 	} catch (error) {
// 		console.error('An error occurred:', error);
// 	}
// }

// function getCookie(name) {
// 	let cookieValue = null;
// 	if (document.cookie && document.cookie !== '') {
// 		const cookies = document.cookie.split(';');
// 		for (let i = 0; i < cookies.length; i++) {
// 			const cookie = cookies[i].trim();
// 			if (cookie.substring(0, name.length + 1) === (name + '=')) {
// 				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
// 				break;
// 			}
// 		}
// 	}
// 	return cookieValue;
// }

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