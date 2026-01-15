// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

// Initialize Supabase client
let supabase = null;

function initSupabase() {
    if (window.supabase && !supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (err) {
            console.error("Supabase Init Error:", err);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');

    initSupabase();

    // Pages configuration
    const AUTH_PAGES = ['login.html', 'register.html'];
    // matrix.html and matrix-result.html are now PRIVATE
    const PRIVATE_PAGES = ['matrix.html', 'matrix-result.html', 'dashboard.html', 'products.html'];

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    async function getUser() {
        if (!supabase) initSupabase();
        if (!supabase) return null;
        try {
            // Use getSession for faster check, then getUser for security
            const { data: { session } } = await supabase.auth.getSession();
            return session ? session.user : null;
        } catch (e) {
            return null;
        }
    }

    async function checkAccess() {
        const user = await getUser();

        // If on a private page and NO USER -> Go to Login
        if (PRIVATE_PAGES.includes(page) && !user) {
            window.location.href = 'login.html';
            return;
        }

        // If on auth page and HAS USER -> Go to Home
        if (AUTH_PAGES.includes(page) && user) {
            window.location.href = 'index.html';
            return;
        }
    }

    async function updateHeader() {
        const user = await getUser();
        const headerActions = document.querySelector('.header-actions');
        let authBtn = document.getElementById('headerAuthBtn');

        if (!headerActions) return;

        if (!authBtn) {
            authBtn = document.createElement('a');
            authBtn.id = 'headerAuthBtn';
            authBtn.className = 'action-link auth-btn-dynamic';
            headerActions.insertBefore(authBtn, headerActions.firstChild);
        }

        if (user) {
            // Logged In State
            authBtn.href = 'index.html';
            authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

            // Ensure Logout button exists
            if (!document.getElementById('headerLogoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'headerLogoutBtn';
                logoutBtn.className = 'icon-btn auth-btn-dynamic';
                logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
                logoutBtn.title = 'Выйти';
                logoutBtn.onclick = logout;
                headerActions.insertBefore(logoutBtn, document.querySelector('.mobile-toggle'));
            }
        } else {
            // Logged Out State
            authBtn.href = 'login.html';
            authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';

            // Remove logout if exists
            const existingLogout = document.getElementById('headerLogoutBtn');
            if (existingLogout) existingLogout.remove();
        }
    }

    async function logout() {
        if (supabase) {
            await supabase.auth.signOut();
        }
        window.location.href = 'index.html';
    }

    // Auth Form Bindings
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
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('authError');

            const { data, error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: name } }
            });

            if (error) {
                errorDiv.textContent = error.message;
            } else if (data.user && !data.session) {
                errorDiv.style.color = 'green';
                errorDiv.textContent = 'Проверьте почту для подтверждения!';
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Initialize
    await checkAccess();
    await updateHeader();

    // Index Page specific: lock non-primary cards for guests
    if (page === 'index.html' || page === '') {
        const user = await getUser();
        const cards = document.querySelectorAll('.hero-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // If guest and the card points to a private page or is explicitly locked
                if (!user && (card.getAttribute('href') === 'matrix.html' || card.classList.contains('is-locked'))) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
            });
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

    // PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }
});
