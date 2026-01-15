// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

// Initialize Supabase client (will be set after SDK loads)
let supabase = null;

document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');

    // Wait for Supabase SDK to load
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // Auth Logic
    const AUTH_PAGES = ['login.html', 'register.html'];
    const PRIVATE_PAGES = ['dashboard.html', 'products.html'];

    // Get current filename
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    async function getUser() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    async function checkAccess() {
        const user = await getUser();

        if (AUTH_PAGES.includes(page) && user) {
            window.location.href = 'index.html';
            return;
        }

        if (PRIVATE_PAGES.includes(page) && !user) {
            window.location.href = 'login.html';
            return;
        }
    }

    async function updateHeader() {
        const user = await getUser();
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Clean up existing auth buttons to prevent duplicates
        const existingAuth = headerActions.querySelectorAll('.auth-btn-dynamic');
        existingAuth.forEach(el => el.remove());

        if (user) {
            // Logged In: Show Home + Logout
            const homeBtn = document.createElement('a');
            homeBtn.href = 'index.html';
            homeBtn.className = 'action-link auth-btn-dynamic';
            homeBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'icon-btn auth-btn-dynamic';
            logoutBtn.setAttribute('aria-label', 'Выйти');
            logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
            logoutBtn.onclick = logout;

            const toggleBtn = headerActions.querySelector('.mobile-toggle');
            headerActions.insertBefore(homeBtn, toggleBtn);
            headerActions.insertBefore(logoutBtn, toggleBtn);
        } else {
            // Logged Out: Show Login Link
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.className = 'action-link auth-btn-dynamic';
            loginBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';

            const toggleBtn = headerActions.querySelector('.mobile-toggle');
            headerActions.insertBefore(loginBtn, toggleBtn);
        }
    }

    async function login(e) {
        if (e) e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorDiv = document.getElementById('authError');

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!supabase) {
            if (errorDiv) errorDiv.textContent = 'Ошибка загрузки. Обновите страницу.';
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            if (errorDiv) {
                errorDiv.textContent = error.message === 'Invalid login credentials'
                    ? 'Неверный email или пароль'
                    : error.message;
            }
            return;
        }

        window.location.href = 'index.html';
    }

    async function register(e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorDiv = document.getElementById('authError');

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value;
        const password = passwordInput.value;
        const name = nameInput ? nameInput.value : '';

        if (!supabase) {
            if (errorDiv) errorDiv.textContent = 'Ошибка загрузки. Обновите страницу.';
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: name }
            }
        });

        if (error) {
            if (errorDiv) {
                errorDiv.textContent = error.message;
            }
            return;
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            if (errorDiv) {
                errorDiv.style.color = 'green';
                errorDiv.textContent = 'Проверьте вашу почту для подтверждения!';
            }
            return;
        }

        window.location.href = 'index.html';
    }

    async function logout() {
        if (supabase) {
            await supabase.auth.signOut();
        }
        window.location.href = 'index.html';
    }

    // Initialize
    await checkAccess();
    await updateHeader();

    // Bind Forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', login);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', register);

    // Active Card Logic (Index Page)
    if (page === 'index.html' || page === '') {
        const cards = document.querySelectorAll('.hero-card');
        const user = await getUser();

        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!user) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
            });

            if (!user) {
                card.style.cursor = 'pointer';
            }
        });
    }

    // Mobile Toggle Logic
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');

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

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW Registered'))
                .catch(err => console.log('SW Error', err));
        });
    }
});
