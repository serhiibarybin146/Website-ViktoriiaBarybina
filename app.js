// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

let supabaseClient = null;

function initSupabase() {
    if (!supabaseClient && typeof window.supabase !== 'undefined') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (err) {
            console.error("Supabase Init Error:", err);
        }
    }
}

// Global Auth Handlers (Exposed to Window)
window.handleLogin = async function (event) {
    event.preventDefault();
    initSupabase();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('authError');

    if (errorDiv) {
        errorDiv.style.color = '#333';
        errorDiv.textContent = 'Вход...';
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        if (errorDiv) {
            errorDiv.style.color = '#dc3545';
            errorDiv.textContent = error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message;
        }
    } else {
        window.location.href = '/';
    }
    return false;
};

window.handleRegister = async function (event) {
    event.preventDefault();
    initSupabase();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const errorDiv = document.getElementById('authError');
    const form = document.getElementById('registerForm');

    if (errorDiv) {
        errorDiv.style.color = '#333';
        errorDiv.textContent = 'Регистрация...';
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email, password, options: {
            data: { full_name: name },
            emailRedirectTo: 'https://viktoriiabarybina.com/login.html'
        }
    });

    if (error) {
        if (errorDiv) {
            errorDiv.style.color = '#dc3545';
            errorDiv.textContent = error.message;
        }
    } else {
        // Show success screen for both cases (with or without session)
        if (form) {
            form.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <iconify-icon icon="solar:check-circle-bold" style="font-size: 48px; color: #4CAF50;"></iconify-icon>
                    <h3 style="margin: 10px 0;">Успешно!</h3>
                    <a href="login.html" class="btn-primary" style="margin-top: 15px; display: inline-block; text-decoration: none;">Перейти ко входу</a>
                </div>
            `;
        }
    }
    return false;
};

// Global Logout
window.forceSignOut = async () => {
    initSupabase();
    if (supabaseClient) await supabaseClient.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login.html';
};

document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();

    // Mobile menu toggle
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const active = nav.classList.toggle('active');
            toggle.setAttribute('aria-expanded', active);
            // On mobile, the CSS will handle visibility via .active class
        });

        // Close menu when a link is clicked
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // PWA Support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }

    // Access Check & Header Update
    const AUTH_PAGES = ['login.html', 'register.html', 'login', 'register'];
    const PRIVATE_PAGES = ['matrix.html', 'matrix-result.html', 'matrix', 'matrix-result'];

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const pageName = page.replace('.html', '').toLowerCase();

    // Init User Function (Helper)
    async function getUser() {
        if (!supabaseClient) return null;
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            return session ? session.user : null;
        } catch (e) { return null; }
    }

    // Update Header UI
    async function updateHeader() {
        const user = await getUser();
        let authBtn = document.getElementById('headerAuthBtn');
        let headerActions = document.querySelector('.header-actions');
        let mobileNavList = document.querySelector('.main-nav .nav-list');

        if (authBtn) {
            // Always hide auth button in header on mobile, move it to menu instead
            authBtn.classList.add('desktop-only');

            if (user) {
                authBtn.href = '/';
                authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

                // Add Home to mobile nav if not present
                let mobileHome = document.getElementById('mobileHomeLink');
                if (!mobileHome && mobileNavList) {
                    const li = document.createElement('li');
                    li.id = 'mobileHomeLi';
                    li.className = 'mobile-only';
                    mobileHome = document.createElement('a');
                    mobileHome.id = 'mobileHomeLink';
                    mobileHome.href = '/';
                    mobileHome.className = 'nav-link';
                    mobileHome.innerHTML = 'Главная';
                    li.appendChild(mobileHome);
                    mobileNavList.insertBefore(li, mobileNavList.firstChild);
                }

                // Ensure Exit link is in the mobile nav list
                let mobileExit = document.getElementById('mobileExitLink');
                if (!mobileExit && mobileNavList) {
                    const li = document.createElement('li');
                    li.id = 'mobileExitLi';
                    li.className = 'mobile-only';
                    mobileExit = document.createElement('a');
                    mobileExit.id = 'mobileExitLink';
                    mobileExit.href = '#';
                    mobileExit.className = 'nav-link';
                    mobileExit.innerHTML = 'Выйти';
                    mobileExit.addEventListener('click', (e) => {
                        e.preventDefault();
                        forceSignOut();
                    });
                    li.appendChild(mobileExit);
                    mobileNavList.appendChild(li);
                }

                // Hide Login from mobile nav if present
                const mobileLoginLi = document.getElementById('mobileLoginLi');
                if (mobileLoginLi) mobileLoginLi.remove();

                // Add Logout button next to Home (for desktop)
                let logoutBtn = document.getElementById('headerLogoutBtn');
                if (!logoutBtn && headerActions) {
                    logoutBtn = document.createElement('a');
                    logoutBtn.id = 'headerLogoutBtn';
                    logoutBtn.href = '#';
                    logoutBtn.className = 'action-link auth-btn-dynamic desktop-only';
                    logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon> Выйти';
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        forceSignOut();
                    });
                    authBtn.insertAdjacentElement('afterend', logoutBtn);
                }
            } else {
                authBtn.href = 'login.html';
                authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';

                // Add Login to mobile nav if not present
                let mobileLogin = document.getElementById('mobileLoginLink');
                if (!mobileLogin && mobileNavList) {
                    const li = document.createElement('li');
                    li.id = 'mobileLoginLi';
                    li.className = 'mobile-only';
                    mobileLogin = document.createElement('a');
                    mobileLogin.id = 'mobileLoginLink';
                    mobileLogin.href = 'login.html';
                    mobileLogin.className = 'nav-link';
                    mobileLogin.innerHTML = 'Войти';
                    li.appendChild(mobileLogin);
                    mobileNavList.appendChild(li);
                }

                // Remove Home and Exit from mobile nav
                const mobileHomeLi = document.getElementById('mobileHomeLi');
                if (mobileHomeLi) mobileHomeLi.remove();

                const mobileExitLi = document.getElementById('mobileExitLi');
                if (mobileExitLi) mobileExitLi.remove();

                const logoutBtn = document.getElementById('headerLogoutBtn');
                if (logoutBtn) logoutBtn.remove();
            }
        }
    }

    // Security Check
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
        updateHeader();
    })();

    // Homepage Cards Logic(Secure by Default)
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
                if (!user && isMatrix) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
            });
        });
    }
});
