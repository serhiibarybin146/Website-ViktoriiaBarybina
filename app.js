// Supabase Configuration
const SUPABASE_URL = 'https://vunhqcczjkxneltnffbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tjoFdDgs4I3zgrkHOe0FgQ_uKm4ivL3';

window.supabaseClient = null;

window.initSupabase = function () {
    if (window.supabaseClient) return true;

    if (typeof window.supabase !== 'undefined') {
        try {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase initialized successfully");
            return true;
        } catch (err) {
            console.error("Supabase Init Error:", err);
            return false;
        }
    }
    return false;
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

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

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

    const { data, error } = await window.supabaseClient.auth.signUp({
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
    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
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
            nav.style.display = active ? 'block' : '';
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
        if (!window.supabaseClient) return null;
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            return session ? session.user : null;
        } catch (e) { return null; }
    }

    // Update Header UI
    async function updateHeader() {
        const user = await getUser();
        let authBtn = document.getElementById('headerAuthBtn');
        let headerActions = document.querySelector('.header-actions');

        // Hide nav logout link (user wants it in header-actions instead)
        const navLogout = document.getElementById('navLogoutLink');
        if (navLogout) navLogout.style.display = 'none';

        if (authBtn) {
            if (user) {
                authBtn.href = '/';
                authBtn.innerHTML = '<iconify-icon icon="solar:widget-linear"></iconify-icon> Главная';

                // Add Logout button next to Home if not already there
                let logoutBtn = document.getElementById('headerLogoutBtn');
                if (!logoutBtn && headerActions) {
                    logoutBtn = document.createElement('a');
                    logoutBtn.id = 'headerLogoutBtn';
                    logoutBtn.href = '#';
                    logoutBtn.className = 'action-link auth-btn-dynamic';
                    logoutBtn.innerHTML = '<iconify-icon icon="solar:logout-2-linear"></iconify-icon> Выйти';
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        forceSignOut();
                    });
                    // Insert after Auth button
                    authBtn.insertAdjacentElement('afterend', logoutBtn);
                } else if (logoutBtn) {
                    logoutBtn.style.display = 'inline-flex';
                }
            } else {
                authBtn.href = 'login.html';
                authBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear"></iconify-icon> Войти';

                // Hide logout button if exists
                const logoutBtn = document.getElementById('headerLogoutBtn');
                if (logoutBtn) logoutBtn.style.display = 'none';
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

        // Fetch specific permissions if logged in
        let permissions = [];
        if (user && window.supabaseClient) {
            console.log("Checking permissions for user:", user.id);
            try {
                const { data, error } = await window.supabaseClient
                    .from('user_access')
                    .select('feature_key');

                if (error) {
                    console.error("Permission fetch error:", error);
                }

                if (data) {
                    permissions = data.map(p => p.feature_key);
                    console.log("Found permissions:", permissions);
                }
            } catch (e) { console.error("Access fetch error:", e); }
        }

        cards.forEach(card => {
            const href = card.getAttribute('href');
            const featureKey = card.getAttribute('data-feature');
            const isBaseMatrix = href?.includes('matrix.html') || href === 'matrix';

            // Function to reveal the card
            const unlockCard = () => {
                card.classList.remove('is-locked');
                card.classList.add('is-unlocked');

                // Update front icon to indicate it's now a link
                const lockIcon = card.querySelector('.card-lock-icon');
                if (lockIcon) {
                    lockIcon.innerHTML = '<iconify-icon icon="solar:arrow-right-linear"></iconify-icon>';
                    lockIcon.className = 'card-arrow';
                }

                // Custom descriptions for each feature
                const featureDetails = {
                    'compatibility': 'Узнайте потенциал ваших отношений, общие задачи и кармические связи с партнером.',
                    'year': 'Прогноз главных энергий вашего года — на что направить фокус и каких уроков ожидать.',
                    'month': 'Детальный путеводитель по энергиям каждого месяца для вашего личного развития.',
                    'calendar': 'Персональный расчет энергий на каждый день для эффективного планирования дел.',
                    'child': 'Поймите таланты и особенности вашего ребенка через призму его даты рождения.'
                };

                // Update back side content to match "Main Matrix" style
                const backFace = card.querySelector('.hero-card-back');
                if (backFace) {
                    const desc = featureDetails[featureKey] || 'Ваш персональный расчет уже готов. Нажмите, чтобы открыть.';
                    backFace.innerHTML = `
                        <p class="card-desc">${desc}</p>
                        <div class="card-footer">
                            <span class="card-cta">Посмотреть</span>
                            <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
                        </div>
                    `;
                }
            };

            // Logic: Unlock if it's the base matrix OR if user has explicit permission
            if (user) {
                if (isBaseMatrix || permissions.includes(featureKey)) {
                    unlockCard();
                }
            }

            card.addEventListener('click', (e) => {
                // If the card is NOT locked, we should navigate
                if (card.classList.contains('is-unlocked')) {
                    const featureMap = {
                        'matrix': 'matrix.html',
                        'compatibility': 'matrix.html', // Pointing to calc for now
                        'year': 'matrix.html',
                        'month': 'matrix.html',
                        'calendar': 'matrix.html'
                    };
                    const url = featureMap[featureKey];
                    if (url && url !== '#') {
                        e.preventDefault();
                        window.location.href = url;
                    }
                } else if (!user && isBaseMatrix) {
                    e.preventDefault();
                    window.location.href = 'login.html';
                }
            });
        });
    }
});
