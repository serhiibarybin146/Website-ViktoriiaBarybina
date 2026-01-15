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

    const AUTH_PAGES = ['login.html', 'register.html', 'login', 'register'];
    const PRIVATE_PAGES = ['matrix.html', 'matrix-result.html', 'matrix', 'matrix-result'];

    const path = window.location.pathname;
    // Get page name without extension for more robust matching
    const page = path.split('/').pop() || 'index.html';
    const pageName = page.replace('.html', '');

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
        const isPrivate = PRIVATE_PAGES.includes(page) || PRIVATE_PAGES.includes(pageName);
        const isAuth = AUTH_PAGES.includes(page) || AUTH_PAGES.includes(pageName);

        if (isPrivate && !user) {
            console.log("Access denied to private page. Redirecting...");
            window.location.href = 'login.html';
            return;
        }

        if (isAuth && user) {
            window.location.href = '/';
            return;
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

    // Run security checks
    await checkAccess();
    updateHeader();

    // Index Page interaction (SECURE BY DEFAULT)
    if (pageName === 'index' || page === 'index.html' || page === '' || path === '/') {
        const user = await getUser();
        const cards = document.querySelectorAll('.hero-card');

        cards.forEach(card => {
            const href = card.getAttribute('href');
            const isMatrix = href?.includes('matrix.html') || href === 'matrix' || href === '/matrix';

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
                if (!user) {
                    if (isMatrix) {
                        e.preventDefault();
                        window.location.href = 'login.html';
                    } else {
                        e.preventDefault();
                    }
                }
            });
        });
    }

    // Mobile Toggle - FIXING MISSING DECLARATIONS
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');
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
