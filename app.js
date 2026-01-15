// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

// Initialize Supabase client
let supabase = null;

function initSupabase() {
    if (window.supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase initialized successfully");
        } catch (err) {
            console.error("Supabase initialization failed:", err);
        }
    } else {
        console.warn("Supabase SDK not found on window object");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded - Initializing App");

    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');

    initSupabase();

    // Pages configuration
    const AUTH_PAGES = ['login.html', 'register.html'];
    const PRIVATE_PAGES = ['dashboard.html', 'products.html'];

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    async function getUser() {
        if (!supabase) return null;
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (err) {
            console.error("Error getting user from Supabase:", err);
            return null;
        }
    }

    async function checkAccess() {
        const user = await getUser();
        console.log("Checking access for page:", page, "User authenticated:", !!user);

        if (AUTH_PAGES.includes(page) && user) {
            console.log("Redirecting logged-in user from auth page to index");
            window.location.href = 'index.html';
            return;
        }

        if (PRIVATE_PAGES.includes(page) && !user) {
            console.log("Redirecting guest from private page to login");
            window.location.href = 'login.html';
            return;
        }
    }

    async function updateHeader() {
        console.log("Updating header UI...");
        const user = await getUser();
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) {
            console.warn("Header actions container not found");
            return;
        }

        // Clean up existing dynamic buttons
        const existingAuth = headerActions.querySelectorAll('.auth-btn-dynamic');
        existingAuth.forEach(el => el.remove());

        const toggleBtn = headerActions.querySelector('.mobile-toggle');

        if (user) {
            // Logged In: Show Home/Dashboard + Logout
            const homeBtn = document.createElement('a');
            homeBtn.href = 'index.html';
            homeBtn.className = 'action-link auth-btn-dynamic';
            homeBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'icon-btn auth-btn-dynamic';
            logoutBtn.setAttribute('aria-label', 'Выйти');
            logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
            logoutBtn.onclick = logout;

            headerActions.insertBefore(homeBtn, toggleBtn);
            headerActions.insertBefore(logoutBtn, toggleBtn);
        } else {
            // Logged Out: Show Login Link
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.className = 'action-link auth-btn-dynamic';
            loginBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';

            headerActions.insertBefore(loginBtn, toggleBtn);
        }
        console.log("Header UI updated.");
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
            if (errorDiv) errorDiv.textContent = 'Ошибка загрузки базы данных.';
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

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
            if (errorDiv) errorDiv.textContent = 'Ошибка загрузки базы данных.';
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name } }
        });

        if (error) {
            if (errorDiv) errorDiv.textContent = error.message;
            return;
        }

        if (data.user && !data.session) {
            if (errorDiv) {
                errorDiv.style.color = 'green';
                errorDiv.textContent = 'Регистрация успешна! Проверьте почту.';
            }
            return;
        }
        window.location.href = 'index.html';
    }

    async function logout() {
        if (supabase) await supabase.auth.signOut();
        window.location.href = 'index.html';
    }

    // Execution sequence
    await checkAccess();
    await updateHeader();

    // Event Bindings
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', login);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', register);

    // Index Page Specific logic
    if (page === 'index.html' || page === '') {
        const cards = document.querySelectorAll('.hero-card');
        const user = await getUser();
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!user && card.classList.contains('is-locked')) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
            });
            if (!user) card.style.cursor = 'pointer';
        });
    }

    // Mobile Toggle
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
            nav.style.display = !isExpanded ? 'block' : '';
        });
    }

    // SW Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }
});
