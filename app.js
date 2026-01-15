// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

// Direct Global Initialization
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
    // Clear all cookies for good measure
    document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login.html';
};
window.forceSignOut = forceSignOut;

document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();

    const AUTH_PAGES = ['login.html', 'register.html', 'login', 'register'];
    const PRIVATE_PAGES = ['matrix.html', 'matrix-result.html', 'matrix', 'matrix-result'];

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const pageName = page.replace('.html', '').toLowerCase();

    async function getUser() {
        initSupabase();
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
        const isPrivate = PRIVATE_PAGES.some(p => page.includes(p) || pageName === p);
        const isAuth = AUTH_PAGES.some(p => page.includes(p) || pageName === p);

        if (isPrivate && !user) {
            window.location.replace('login.html');
            return false;
        }

        if (isAuth && user) {
            window.location.replace('/');
            return false;
        }
        return true;
    }

    async function updateHeader() {
        const user = await getUser();
        const headerActions = document.querySelector('.header-actions');
        const navList = document.querySelector('.nav-list');
        let authBtn = document.getElementById('headerAuthBtn');

        // 1. Update main action button
        if (authBtn) {
            if (user) {
                authBtn.href = '/';
                authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';
            } else {
                authBtn.href = 'login.html';
                authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';
            }
        }

        // 2. Add/Remove logout icons and links
        if (user) {
            // Header icon
            if (!document.getElementById('headerLogoutBtn') && headerActions) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'headerLogoutBtn';
                logoutBtn.className = 'icon-btn auth-btn-dynamic';
                logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon>';
                logoutBtn.onclick = forceSignOut;
                headerActions.insertBefore(logoutBtn, document.querySelector('.mobile-toggle'));
            }
            // Nav list link (mobile/desktop link)
            if (!document.getElementById('navLogoutItem') && navList) {
                const li = document.createElement('li');
                li.id = 'navLogoutItem';
                li.innerHTML = '<a href="#" class="nav-link" onclick="forceSignOut(); return false;">Выйти</a>';
                navList.appendChild(li);
            }
        } else {
            const existingBtn = document.getElementById('headerLogoutBtn');
            if (existingBtn) existingBtn.remove();
            const existingItem = document.getElementById('navLogoutItem');
            if (existingItem) existingItem.remove();
        }
    }

    // Run Security Check ASAP
    const isAllowed = await checkAccess();
    if (!isAllowed) return; // Stop if redirecting

    updateHeader();

    // Index Page specific logic
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
                if (!user) {
                    if (isMatrix) {
                        e.preventDefault();
                        window.location.href = 'login.html';
                    } else {
                        // Let modal handle it or prevent if matrix
                        if (isMatrix) e.preventDefault();
                    }
                }
            });
        });
    }

    // Auth Forms
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
                window.location.href = '/';
            }
        });
    }

    // Mobile menu toggle
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const active = nav.classList.toggle('active');
            toggle.setAttribute('aria-expanded', active);
            nav.style.display = active ? 'block' : '';
        });
    }

    // PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }
});
