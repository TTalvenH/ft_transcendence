import { showToast, circle_check, circle_xmark } from "./utils.js"
import { router } from "./router.js"
import { currentUser } from "./user.js";

async function editProfileHandler() {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	const userContainer = document.getElementById('userContainer');
	
	try {
		const updateProfileResponse = await fetch("/users/update_profile.html", {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + userData.accessToken,
			},
		});
		
		if (!updateProfileResponse.ok) {
			showToast(circle_xmark + 'Something went wrong', true);
			return;
		}
		
		const updateProfileHTML = await updateProfileResponse.text();
		userContainer.innerHTML = "";
		userContainer.insertAdjacentHTML('beforeend', updateProfileHTML);

		const input = document.getElementById('imageInput');
		const profileImage = document.getElementById('profileImage');
		let selectedFile = null;

		input.addEventListener('change', async (event) => {
			selectedFile = input.files[0];
			if (selectedFile) {
				const reader = new FileReader();
				reader.onload = function(e) {
					profileImage.src = e.target.result;
					profileImage.onload = function() {
						profileImage.style.display = 'block';
					}
				}
				reader.readAsDataURL(selectedFile);
			}
		});
		const updateProfileForm = document.getElementById('updateProfileForm');
		const flexSwitch2FA = document.getElementById('flexSwitch2FA');
		const flexSwitchEmailOtp = document.getElementById('flexSwitchEmailOtp');
		const twoFactorMethodInput = document.getElementById('2FA');
	
		// Function to handle checkbox changes
		function updateTwoFactorMethod() {
			let method = '';
			if (flexSwitch2FA.checked) {
				method = 'app';
			} else if (flexSwitchEmailOtp.checked) {
				method = 'email';
			}
			twoFactorMethodInput.value = method;
		}
		
		// Attach event listeners to the checkboxes
		flexSwitch2FA.addEventListener('change', updateTwoFactorMethod);
		flexSwitchEmailOtp.addEventListener('change', updateTwoFactorMethod);
		
		updateProfileForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			if (flexSwitch2FA.checked && flexSwitchEmailOtp.checked) {
				showToast(circle_xmark + 'Choose only one method', true);
				return;
			}
			try {
				const userData = JSON.parse(localStorage.getItem('currentUser'));
				const formData = new FormData(updateProfileForm);
				if (selectedFile) {
					formData.append('image', selectedFile);
				}

				const response = await fetch('/users/update-user-profile', {
					method: 'PUT',
					headers: {
						'Authorization': 'Bearer ' + userData.accessToken
					},
					body: formData
				});

				if (response.ok) {
					const data = await response.json();
					let current_user_data = JSON.parse(localStorage.getItem('currentUser'));
					current_user_data.username = data.user.username;
					current_user_data.id = data.user.id;
					localStorage.setItem('currentUser', JSON.stringify(current_user_data));

					if (data.otp_setup_needed || data.email_otp_setup_needed) {
						const otpResponse = await fetch('/users/otpSetup-profile', {
							method: 'POST',
							headers: {
								'Authorization': 'Bearer ' + userData.accessToken,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ 
								enable_otp: data.otp_setup_needed, 
								enable_email_otp: data.email_otp_setup_needed 
							})
						});

						if (otpResponse.ok) {
							const otpResult = await otpResponse.json();
							console.log(otpResult);
							await handleOtpVerification(otpResult);
						} else {
							const otpError = await otpResponse.json();
							showToast(circle_xmark `${otpError.detail || 'OTP setup failed'}`, true);
							return;
						}
					} else {
						showToast(circle_check + 'Profile updated successfully', false);
						history.pushState({}, "", "/profile");
						router.handleLocation();
					}
				} else {
					const data = await response.json();
					if (data) {
						showToast(circle_xmark + data.detail, true);
					} else {
						showToast(circle_xmark + 'Something went wrong', true);
					}
				}
			} catch (error) {
				console.error('Error during profile update:', error);
				showToast(circle_xmark + 'Something went wrong', true);
			}
		});

		const checkBox = document.getElementById('flexSwitchCheckDefault');
		checkBox.addEventListener('change', (event) => {
			const passwordFields = document.querySelectorAll('.passwordField');
			if (event.target.checked) {
				passwordFields.forEach((passwordField) => {
					const passwordInput = passwordField.getElementsByTagName('input')[0];
					passwordInput.setAttribute('required', '');
					passwordField.style.display = 'block';
				});
			} else {
				passwordFields.forEach((passwordField) => {
					const passwordInput = passwordField.getElementsByTagName('input')[0];
					passwordInput.removeAttribute('required', '');
					passwordField.style.display = 'none';
				});
			}
		});
	} catch (error) {
		console.error('Error during profile HTML fetch:', error);
		showToast(circle_xmark + 'Something went wrong', true);
	}
}

async function handleOtpVerification(data) {
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = '';
	console.log('hi mom');
    if (data.qr_html)
		userContainer.insertAdjacentHTML('beforeend', data.qr_html);
	else {
		if (!window.otpFormHTML) {
			window.otpFormHTML = await fetchHTML("/users/qr_prompt.html");
		}
		userContainer.insertAdjacentHTML('beforeend', window.otpFormHTML);
		console.log('Inserted OTP form HTML');
	}

	const otpForm = document.getElementById('otpForm');
	if (otpForm) {
		console.log('OTP form found');
		console.log(data.username);
		otpForm.addEventListener('submit', (event) => handleOtpVerificationSubmitFromProfile(event, data.username));
	} else {
		console.error('OTP form not found');
	}
}

async function handleOtpVerificationSubmitFromProfile(event, username) {
	event.preventDefault();

	const otpForm = event.target;
	const otpFormData = new FormData(otpForm);
	otpFormData.append('username', username);

	try {
		const userData = JSON.parse(localStorage.getItem('currentUser'));
		const verifyResponse = await fetch('/users/verify-otp', {
			method: 'POST',
			body: otpFormData
		});

		if (verifyResponse.ok) {
			const verifyResult = await verifyResponse.json();
			showToast(circle_check + 'Profile updated successfully', false);
			history.pushState({}, "", "/profile");
			router.handleLocation();
		} else {
			showToast(circle_xmark + 'Verification failed', true);
		}
	} catch (error) {
		console.log(error);
		showToast(circle_xmark + 'Something went wrong', true);
	}
}

async function profileHandler() {
	const userData = currentUser.getUser();
	const urlParams = new URLSearchParams(window.location.search);
	let username = urlParams.get('username');
	if (!username) {
		if (!userData) {
			history.pushState({}, "", "/");
			router.handleLocation();
			return;
		}
		username = userData.username;
	} else if (username === userData.username) {
		history.pushState({}, "", "/profile");
	}
	const userContainer = document.getElementById('userContainer');
	let profileHTML;
	const profileResponse = await fetch(`/users/profile.html/${username}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	})
	if (profileResponse.ok) {
		profileHTML = await profileResponse.text();
	} else {
		showToast(circle_xmark + 'Something went wrong', true);
		history.pushState({}, "", "/");
		router.handleLocation();
		return;
	}

	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', profileHTML);
	const editProfileButton = document.getElementById('editProfile');
	const addFriendDiv = document.getElementById('addFriendDiv');
	if (username === userData.username) {
		editProfileButton.style.display = 'flex';
		addFriendDiv.style.display = 'flex';
	} else {
		editProfileButton.style.display = 'none';
		addFriendDiv.style.display = 'none';
	}
	const addFriendButton = document.getElementById('addFriendButton');
	addFriendButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const friendInput = document.getElementById('friendInput');
		if (friendInput.value) {
			const response = await fetch(`/users/add-friend/${friendInput.value}/`, {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + userData.accessToken
				}
				});
			if (response.ok) {
				const data = await response.json();
				console.log(data);
				createFriendRow(data);
				showToast(circle_check + 'Friend added successfully', false);
			} else {
				if (response.status === 400) {
					showToast(circle_xmark + 'User already a friend', true);
				} else {
					showToast(circle_xmark + 'User not found', true);
				}
			}
		}
	});

	const switchTable = document.getElementById('switchButton');
	switchTable.addEventListener('click', () => {
		console.log('click');
		const match_history_table = document.getElementById('match_history');
		console.log(match_history_table.style.display);
		const tournament_history_table = document.getElementById('tournament_history');
		const tableHeader = document.getElementById('tableHeader');
		if (match_history_table.style.display === 'none') {
			tableHeader.innerText = 'Match History';
			match_history_table.style.display = 'block';
			tournament_history_table.style.display = 'none';
		} else {
			tableHeader.innerText = 'Tournament History';
			match_history_table.style.display = 'none';
			tournament_history_table.style.display = 'block';
		}
	})
}

async function loginHandler() {
    if (!window.loginFormHTML) {
        window.loginFormHTML = await fetchHTML("/users/login.html");
    }
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = '';
    userContainer.insertAdjacentHTML('beforeend', window.loginFormHTML);

    // Add event listener to the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

async function fetchHTML(url) {
	try {
		const response = await fetch(url);
		if (response.ok) {
			return response.text();
		} else {
			showToast(circle_xmark + 'Something went wrong', true);
			return '';
		}
	} catch (error) {
		showToast(circle_xmark + 'Something went wrong', true);
		return '';
	}
}

let currentUsername = null;

async function handleLoginSubmit(event) {
	event.preventDefault();
	const loginForm = event.target;
	let formData = new FormData(loginForm);
	try {
		let response = await fetch('/users/login-user', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			const loginData = await response.json();
			currentUsername = formData.get('username');
			console.log('stuff is:', loginData.two_factor_method, loginData.otp_verified, loginData.email_otp_verified);
			
			if ((loginData.two_factor_method === 'app' && loginData.otp_verified) || (loginData.two_factor_method === 'email' && loginData.email_otp_verified)) {
				console.log("Condition 1 met");
				loginForm.remove();
				await loadOtpForm();
			} else {
				console.log("Else block executed");
				showToast(circle_check + 'Login success', false);
				currentUser.setUser(loginData);
				history.pushState({}, "", "/");
				router.handleLocation();
			}
		}
		else {
			let msg = 'Login error';
			if (response.status === 404)
				msg = 'User not found'
			showToast(circle_xmark + msg, true);
		}
		}
	catch (error) {
		console.log(error);
		showToast(circle_xmark + 'Something went wrong', true);
	}
}


async function loadOtpForm() {
    if (!window.otpFormHTML) {
        window.otpFormHTML = await fetchHTML("/users/qr_prompt.html");
    }
    
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = ''; // Clear the Usercontainer
    userContainer.insertAdjacentHTML('beforeend', window.otpFormHTML);
	console.log('hello');
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
		console.log('otpForm: ', otpForm);
		otpForm.addEventListener('submit', handleOtpSubmit);
    }
}

async function handleOtpSubmit(event) {
	event.preventDefault();
	
    const otpForm = event.target;
    let otpFormData = new FormData(otpForm);

    if (currentUsername) {
		otpFormData.append('username', currentUsername);
	}

    try {
        let otpResponse = await fetch('/users/validate-otp', {
            method: 'POST',
            body: otpFormData
        });
		// console.log('otpResponse: ');
		// console.log(otpResponse.data);
        if (otpResponse.ok) {
			const otpData = await otpResponse.json();
			showToast(circle_check + 'Login success', false);
			currentUser.setUser(otpData);
			history.pushState({}, "", "/");
			router.handleLocation()
        } else {
			showToast(circle_xmark + 'Verification failed', true);
        }
    } catch (error) {
		showToast(circle_xmark + 'Something went wrong', true);
    }
}

async function registerHandler() {
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = "";

    if (!window.registerFormHTML) {
        window.registerFormHTML = await fetch("/users/register.html").then((data) => data.text());
    }

    userContainer.insertAdjacentHTML('beforeend', window.registerFormHTML);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    } else {
        console.error('Registration form not found');
    }
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const registerForm = event.target;
    const formData = new FormData(registerForm);
	// Log the FormData to ensure it's correct
	// for (var pair of formData.entries()) {
	// 	console.log(pair[0]+ ': ' + pair[1]);
	// }
    try {
        const response = await fetch('/users/create-user', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.json();
			// console.log(result);
            await handleRegistrationResponse(result);
        } else {
            const errorResult = await response.json();
            showToast(circle_xmark + `${errorResult.detail || 'Something went wrong'}`, true);
        }
    } catch (error) {
        showToast('Something went wrong', true);
    }
}

async function handleRegistrationResponse(result) {
    const userContainer = document.getElementById('userContainer');
    if (!userContainer) {
        console.error('User container not found');
        return;
    }

	if (result.otp && (result.otp.email_otp || result.qr_html)) {
		if (result.otp.email_otp) {
			try {
				if (!window.verifyHTML) {
					window.verifyHTML = await fetchHTML("/users/qr_prompt.html");
				}
				userContainer.innerHTML = '';
				userContainer.insertAdjacentHTML('beforeend', window.verifyHTML);
				console.log('Inserted verify HTML');
			} catch (error) {
				console.error('Error fetching verify HTML:', error);
			}
		} else if (result.qr_html) {
			userContainer.innerHTML = '';
			userContainer.insertAdjacentHTML('beforeend', result.qr_html);
			console.log('Inserted QR HTML');
		}
		const otpForm = document.getElementById('otpForm');
		if (otpForm) {
			otpForm.addEventListener('submit', (event) => handleOtpVerificationSubmit(event, result.user.username));
			console.log('OTP form found and event listener added');
		} else {
			console.error('OTP form not found');
		}
	}
	else {
		showToast(circle_check + 'Registration successful', false);
		history.pushState({}, "", "/");
		router.handleLocation();
	}
}

async function handleOtpVerificationSubmit(event, username) {
    event.preventDefault();
    
    const otpForm = event.target;
    const otpFormData = new FormData(otpForm);
    otpFormData.append('username', username);
	// console.log('hi there2');
    try {
        const verifyResponse = await fetch('/users/verify-otp', {
            method: 'POST',
            body: otpFormData
        });
        
        if (verifyResponse.ok) {
            const userContainer = document.getElementById('userContainer');
            userContainer.innerHTML = '';
            showToast('Registration successful', false);
            history.pushState({}, "", "/");
			router.handleLocation();
        } else {
            showToast(circle_xmark + 'Verification failed', true);
        }
    } catch (error) {
        showToast('Something went wrong', true);
    }
}

async function tournamentInfoHandler() {
	console.log('tournamentInfoHandler');
	const userData = currentUser.getUser();
	const urlParams = new URLSearchParams(window.location.search);
	let id = urlParams.get('id');
	if (!id) {
		history.pushState({}, "", "/");
		router.handleLocation();
		return;
	}
	const response = await fetch(`/pong/get_tournament_info/${id}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	})
	if (!response.ok) {
		showToast(circle_xmark + 'Something went wrong', true);
		return;
	}
	const data = await response.text();
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', data);

	const cancelButton = document.getElementById('cancel');
	cancelButton.addEventListener('click', () => {
		history.pushState({}, "", "/profile");
		router.handleLocation();
	});
}

async function homeHandler() {
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
}

export { editProfileHandler, profileHandler, loginHandler, registerHandler, tournamentInfoHandler, homeHandler }