document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const identifier = document.getElementById('login-identifier').value;
            const password = document.getElementById('login-password').value;

            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: identifier, password })
            });

            const msg = document.getElementById('login-message');

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                msg.textContent = 'Login successful!';
                window.location.href = 'dashboard.html';
            } else {
                msg.textContent = 'Invalid credentials.';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async e => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const msg = document.getElementById('register-message');

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                msg.textContent = 'Registration successful! You are now logged in.';
                window.location.href = 'dashboard.html';
            } else {
                msg.textContent = 'Registration failed.';
            }
        });
    }
});
