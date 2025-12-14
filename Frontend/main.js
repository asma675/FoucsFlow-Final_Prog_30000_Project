const API_BASE = 'http://localhost:5277/api/Users';

// Form References
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const messageElement = document.getElementById('message');

// Container References
const loginContainer = document.getElementById('loginFormContainer');
const signupContainer = document.getElementById('signupFormContainer');
const showLoginBtn = document.getElementById('showLoginBtn');
const showSignupBtn = document.getElementById('showSignupBtn');


// --- 1. Form Toggling Logic ---

showLoginBtn.addEventListener('click', () => toggleForms('login'));
showSignupBtn.addEventListener('click', () => toggleForms('signup'));

function toggleForms(mode) {
    messageElement.textContent = ''; // Clear message on switch
    if (mode === 'login') {
        loginContainer.style.display = 'block';
        signupContainer.style.display = 'none';
        showLoginBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
    } else {
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
        showLoginBtn.classList.remove('active');
        showSignupBtn.classList.add('active');
    }
}


// --- 2. Login Form Submission (Existing Logic) ---

loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    Login();
});

async function Login() {
    const emailInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    const credentials = {
        email: emailInput,
        passwordHash: passwordInput // Sending plain password to server to hash
    };

    messageElement.textContent = 'Attempting login...';
    messageElement.style.color = 'blue';

    try {
        const response = await fetch(`${API_BASE}/login`, { // Using the login endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials) 
        });

        if (response.ok) {
            const userData = await response.json(); 
            
            // IMPORTANT: Save the user ID for dashboard requests
            localStorage.setItem('currentUserId', userData.id); 
            
            messageElement.textContent = 'Login Successful! Redirecting...';
            messageElement.style.color = 'green';
            
            // Redirect to dashboard
            setTimeout(() => { 
                window.location.href = 'dashboard.html';
            }, 500); // Give time for message to display

        } else if (response.status === 401) {
            messageElement.textContent = 'Login Failed: Invalid email or password.';
            messageElement.style.color = 'red';
        } else {
            messageElement.textContent = `Login Failed: Server Error (${response.status})`;
            messageElement.style.color = 'red';
        }

    } catch (error) {
        messageElement.textContent = 'Network Error: Could not connect to the authentication server.';
        messageElement.style.color = 'red';
        console.error('Fetch Error:', error);
    }
}


// --- 3. Sign Up Form Submission (New Logic) ---

signupForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    Signup();
});

async function Signup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value; // passwordHash on backend
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;

    const newUser = {
        email: email,
        passwordHash: password, // The backend is responsible for hashing this
        firstName: firstName,
        lastName: lastName,
        // The CreatedDate is required by your model but set by the server, 
        // we'll omit it here and trust the server to handle it on POST
    };

    messageElement.textContent = 'Creating account...';
    messageElement.style.color = 'blue';

    try {
        const response = await fetch(API_BASE, { // Using the base POST /api/Users endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (response.status === 201) { // 201 Created Status
            const userData = await response.json(); 
            
            messageElement.textContent = 'Account created successfully! You are now logged in and redirecting...';
            messageElement.style.color = 'green';
            
            // IMPORTANT: Log in and redirect immediately after successful signup
            localStorage.setItem('currentUserId', userData.id); 

            setTimeout(() => { 
                window.location.href = 'dashboard.html';
            }, 1000); 
            
        } else if (response.status === 409) { // Conflict (Email already exists)
            messageElement.textContent = 'Sign Up Failed: A user with this email already exists.';
            messageElement.style.color = 'red';
        } else {
             const errorData = await response.json();
             messageElement.textContent = `Sign Up Failed: ${errorData.title || response.statusText}`;
             messageElement.style.color = 'red';
        }

    } catch (error) {
        messageElement.textContent = 'Network Error: Could not connect to the server.';
        messageElement.style.color = 'red';
        console.error('Fetch Error:', error);
    }
}