// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

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
    initSupabase();

    const AUTH_PAGES = ['login.html', 'register.html'];
    const PRIVATE_PAGES = ['matrix.html', 'matrix-result.html', 'dashboard.html', 'products.html'];

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    async function getUser() {
        if (!supabase) initSupabase();
        if (!supabase) return null;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session ? session.user : null;
        } catch (e) {
            return null;
        }
    }

    async function checkAccess() {
        const user = await getUser();
        const isPrivate = PRIVATE_PAGES.includes(page);

        if (isPrivate && !user) {
            window.location.href = 'login.html';
            return;
        }

        if (AUTH_PAGES.includes(page) && user) {
            window.location.href = '/';
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
            authBtn.href = '/';
            authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

            // Show Logout Icon in dynamic area
            if (!document.getElementById('headerLogoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'headerLogoutBtn';
                logoutBtn.className = 'icon-btn auth-btn-dynamic';
                logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
                logoutBtn.onclick = forceSignOut;
                headerActions.insertBefore(logoutBtn, document.querySelector('.mobile-toggle'));
            }
        } else {
            authBtn.href = 'login.html';
            authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';
            const existingLogout = document.getElementById('headerLogoutBtn');
            if (existingLogout) existingLogout.remove();
        }
    }

    const forceSignOut = async () => {
        if (supabase) await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        // Clear all cookies
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.href = '/';
    };
    window.forceSignOut = forceSignOut;

    await checkAccess();
    updateHeader();

    // Index Page interaction (SECURE BY DEFAULT)
    if (page === 'index.html' || page === '' || path === '/') {
        const user = await getUser();
        const cards = document.querySelectorAll('.hero-card');

        cards.forEach(card => {
            const isMatrix = card.getAttribute('href') === 'matrix.html';

            // If logged in, unlock everything
            if (user) {
                card.classList.remove('is-locked');
                card.classList.add('is-unlocked');
                const lockIcon = card.querySelector('.card-lock-icon');
                if (lockIcon) {
                    lockIcon.innerHTML = '<iconify-icon icon="solar:arrow-right-linear"></iconify-icon>';
                    lockIcon.className = 'card-arrow';
                }
            }

            card.addEventListener('click', (e) => {
                if (!user && (isMatrix || card.classList.contains('is-locked'))) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
            });
        });
    }

    // Mobile Toggle
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const isActive = nav.classList.contains('active');
            toggle.setAttribute('aria-expanded', isActive);
            nav.style.display = isActive ? 'block' : '';
        });
    }

    // PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }
});
