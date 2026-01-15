document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');

    // Auth Logic
    const AUTH_KEY = 'auth_demo_user';
    const PUBLIC_PAGES = ['index.html', '']; // Landing page
    const AUTH_PAGES = ['login.html', 'register.html'];
    const PRIVATE_PAGES = ['dashboard.html', 'products.html'];

    // Get current filename
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    function isAuth() {
        return !!localStorage.getItem(AUTH_KEY);
    }

    function checkAccess() {
        const user = isAuth();

        if (AUTH_PAGES.includes(page) && user) {
            window.location.href = 'dashboard.html';
            return;
        }

        if (PRIVATE_PAGES.includes(page) && !user) {
            window.location.href = 'login.html';
            return;
        }
    }

    function updateHeader() {
        const user = isAuth();
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Clean up existing auth buttons to prevent duplicates
        const existingAuth = headerActions.querySelectorAll('.auth-btn-dynamic');
        existingAuth.forEach(el => el.remove());

        if (user) {
            // Logged In: Show Dashboard Link + Logout
            const dashBtn = document.createElement('a');
            dashBtn.href = 'index.html';
            dashBtn.className = 'action-link auth-btn-dynamic';
            dashBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Dashboard';

            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'icon-btn auth-btn-dynamic';
            logoutBtn.setAttribute('aria-label', 'Log Out');
            logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
            logoutBtn.onclick = logout;

            // Insert before the mobile toggle
            const toggleBtn = headerActions.querySelector('.mobile-toggle');
            headerActions.insertBefore(dashBtn, toggleBtn);
            headerActions.insertBefore(logoutBtn, toggleBtn);
        } else {
            // Logged Out: Show Login Link
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.className = 'action-link auth-btn-dynamic';
            loginBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Log In';

            const toggleBtn = headerActions.querySelector('.mobile-toggle');
            headerActions.insertBefore(loginBtn, toggleBtn);
        }
    }

    function login(e) {
        if (e) e.preventDefault();
        // Check inputs if needed, for mock just succeed
        const emailInput = document.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : 'user@example.com';

        localStorage.setItem(AUTH_KEY, email);
        window.location.href = 'index.html'; // Redirect to Home (Active State)
    }

    function logout() {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = 'index.html';
    }

    // Initialize
    checkAccess();
    updateHeader();

    // Bind Forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', login);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', login);

    // Active Card Logic (Index Page)
    if (page === 'index.html' || page === '') {
        const cards = document.querySelectorAll('.hero-card');
        const user = isAuth();

        cards.forEach(card => {
            // Set up link behavior
            card.addEventListener('click', (e) => {
                if (!user) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                } else {
                    // Logged in: Allow navigation
                    // For now, these might trigger a "Coming soon" or go to the href
                    // If href is "dashboard.html", it works (auth check on dashboard passes)
                    // But user said "переходить на определенную страницу (создадим позже)"
                    // So we can leave the default href or set it to #

                    // e.preventDefault(); // Uncomment if we want to stay on page
                }
            });

            // Optional: Visual cue for locked state
            if (!user) {
                card.style.cursor = 'pointer'; // Still clickable
                // card.style.opacity = '0.8'; 
            }
        });
    }

    // Existing Mobile Toggle Logic
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');

            // Simple mobile styles injection for active state if not in CSS
            if (!isExpanded) {
                nav.style.display = 'block';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'var(--bg-color)';
                nav.style.padding = '2rem';
                nav.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
            } else {
                nav.style.display = '';
                nav.style.position = '';
                nav.style.top = '';
                nav.style.left = '';
                nav.style.width = '';
                nav.style.background = '';
                nav.style.padding = '';
                nav.style.borderBottom = '';
            }
        });
    }
});
