// Supabase Configuration
// Using the User-provided key
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

let supabase = null;

function initSupabase() {
    if (!supabase && typeof window.supabase !== 'undefined') {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (err) {
            console.error("Supabase Init Error:", err);
        }
    }
}

// Global Logout Utility
const forceSignOut = async () => {
    initSupabase();
    if (supabase) await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login.html';
};
window.forceSignOut = forceSignOut;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init System Immediately
    initSupabase();

    // 2. Attach Listeners IMMEDIATELY (Before Async Checks)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('authError');

            errorDiv.textContent = 'Вход...';

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                errorDiv.textContent = error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message;
            } else {
                window.location.href = '/';
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

            errorDiv.style.color = '#333';
            errorDiv.textContent = 'Регистрация...';

            const { data, error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: name } }
            });

            if (error) {
                errorDiv.style.color = '#dc3545';
                errorDiv.textContent = error.message;
            } else if (data.user && !data.session) {
                errorDiv.style.color = 'green';
                errorDiv.textContent = 'Успешно! Проверьте почту для подтверждения.';
                // Optional: Clear form
                registerForm.reset();
            } else {
                window.location.href = '/';
            }
        });
    }

    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const active = nav.classList.toggle('active');
            toggle.setAttribute('aria-expanded', active);
            nav.style.display = active ? 'block' : '';
        });
    }

    // PWA Support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }

    // 3. NOW Run Secure Checks (Async)
    const AUTH_PAGES = ['login.html', 'register.html', 'login', 'register'];
    const PRIVATE_PAGES = ['matrix.html', 'matrix-result.html', 'matrix', 'matrix-result'];

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const pageName = page.replace('.html', '').toLowerCase();

    async function getUser() {
        if (!supabase) return null;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session ? session.user : null;
        } catch (e) {
            return null;
        }
    }

    async function updateHeader() {
        const user = await getUser();
        const headerActions = document.querySelector('.header-actions');
        let authBtn = document.getElementById('headerAuthBtn');

        // Update Header Button
        if (authBtn) {
            if (user) {
                authBtn.href = '/';
                authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';
            } else {
                authBtn.href = 'login.html';
                authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';
            }
        }

        // Toggle Logout Link (Hardcoded ID)
        if (user) {
            if (document.getElementById('navLogoutLink')) {
                document.getElementById('navLogoutLink').style.display = 'block';
            }
        } else {
            if (document.getElementById('navLogoutLink')) {
                document.getElementById('navLogoutLink').style.display = 'none';
            }
        }
    }

    // Execute Access Check
    await (async function checkAccess() {
        const user = await getUser();
        const isPrivate = PRIVATE_PAGES.some(p => page.includes(p) || pageName === p);
        const isAuth = AUTH_PAGES.some(p => page.includes(p) || pageName === p);

        if (isPrivate && !user) {
            window.location.replace('login.html');
            return;
        }
        if (isAuth && user) {
            window.location.replace('/');
            return;
        }
        // Only update header if we stay
        updateHeader();
    })();

    // Index Page Cards
    if (pageName === 'index' || page === 'index.html' || path === '/' || page === '') {
        const user = await getUser();
        const cards = document.querySelectorAll('.hero-card');

        cards.forEach(card => {
            const href = card.getAttribute('href');
            const isMatrix = href?.includes('matrix.html') || href === 'matrix';

            if (user && isMatrix) {
                card.classList.remove('is-locked');
                card.classList.add('is-unlocked');
                const lockIcon = card.querySelector('.card-lock-icon');
                if (lockIcon) {
                    lockIcon.innerHTML = '<iconify-icon icon="solar:arrow-right-linear"></iconify-icon>';
                    lockIcon.className = 'card-arrow';
                }
            }

            card.addEventListener('click', (e) => {
                // If not logged in and it's matrix -> Login
                if (!user && isMatrix) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
                // If not logged in and NOT matrix -> Let modal handle it (blocked by other script usually)
            });
        });
    }

});
