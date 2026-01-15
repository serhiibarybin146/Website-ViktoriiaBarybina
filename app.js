// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

// Initialize Supabase client
let supabase = null;

function initSupabase() {
    if (window.supabase && !supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase Client Ready");
        } catch (err) {
            console.error("Supabase Init Error:", err);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');

    initSupabase();

    const AUTH_PAGES = ['login.html', 'register.html'];
    const PRIVATE_PAGES = ['dashboard.html', 'products.html'];
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    async function getUser() {
        if (!supabase) initSupabase();
        if (!supabase) return null;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        } catch (e) {
            return null;
        }
    }

    async function checkAccess() {
        const user = await getUser();
        if (AUTH_PAGES.includes(page) && user) {
            window.location.href = 'index.html';
        }
        if (PRIVATE_PAGES.includes(page) && !user) {
            window.location.href = 'login.html';
        }
    }

    async function updateHeader() {
        const user = await getUser();
        const headerActions = document.querySelector('.header-actions');
        let authBtn = document.getElementById('headerAuthBtn');

        if (!headerActions) return;

        // If button is missing from HTML for some reason (cache?), inject it
        if (!authBtn) {
            authBtn = document.createElement('a');
            authBtn.id = 'headerAuthBtn';
            authBtn.className = 'action-link auth-btn-dynamic';
            headerActions.insertBefore(authBtn, headerActions.firstChild);
        }

        if (user) {
            // Logged In
            authBtn.href = 'index.html';
            authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

            // Add Logout Button if not exists
            if (!document.getElementById('headerLogoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'headerLogoutBtn';
                logoutBtn.className = 'icon-btn auth-btn-dynamic';
                logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
                logoutBtn.onclick = logout;
                headerActions.insertBefore(logoutBtn, document.querySelector('.mobile-toggle'));
            }
        } else {
            // Logged Out - FORCE RUSSIAN
            authBtn.href = 'login.html';
            authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';

            // Remove logout if exists
            const existingLogout = document.getElementById('headerLogoutBtn');
            if (existingLogout) existingLogout.remove();
        }
    }

    async function logout() {
        if (supabase) await supabase.auth.signOut();
        window.location.href = 'index.html';
    }

    // Auth flows
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('authError');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                errorDiv.textContent = error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message;
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            const errorDiv = document.getElementById('authError');
            const { data, error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: name } }
            });
            if (error) {
                errorDiv.textContent = error.message;
            } else if (data.user && !data.session) {
                errorDiv.style.color = 'green';
                errorDiv.textContent = 'Регистрация успешна! Проверьте почту.';
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    await checkAccess();
    await updateHeader();

    // Mobile Toggle
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
            nav.style.display = !isExpanded ? 'block' : '';
        });
    }

    // PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }
});
