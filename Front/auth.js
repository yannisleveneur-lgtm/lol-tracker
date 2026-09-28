const AUTH_API_BASE_URL = window.NYJ_API_BASE_URL || '/api';
const AUTH_SESSION_KEY = 'nyj-auth-session';
const DEMO_ACCOUNT = {
    email: 'jonathan@ecole.fr',
    password: 'Password123!',
    user: {
        id_utilisateur: 'demo',
        pseudo_site: 'djow',
        email: 'jonathan@ecole.fr',
        id_groupe: 1
    }
};

function authEscapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizeAuthUser(user) {
    return {
        id_utilisateur: user.id_utilisateur || user.id || '',
        pseudo_site: user.pseudo_site || user.pseudo || user.username || user.name || 'Invocateur',
        email: user.email || '',
        id_groupe: user.id_groupe || '',
        date_inscription: user.date_inscription || ''
    };
}

function readAuthSession() {
    const serialized = sessionStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem(AUTH_SESSION_KEY);
    if (!serialized) return null;

    try {
        const session = JSON.parse(serialized);
        if (!session.user) throw new Error('Session invalide');
        session.user = normalizeAuthUser(session.user);
        return session;
    } catch (error) {
        clearAuthSession();
        return null;
    }
}

function saveAuthSession(session, remember = false) {
    clearAuthSession();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_SESSION_KEY, JSON.stringify({
        token: session.token || '',
        source: session.source || 'api',
        user: normalizeAuthUser(session.user)
    }));
}

function clearAuthSession() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
}

function isPersistentAuthSession() {
    return Boolean(localStorage.getItem(AUTH_SESSION_KEY));
}

async function authRequest(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const session = readAuthSession();
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    try {
        const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
            ...options,
            headers,
            signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(
                payload.erreur ||
                payload.message ||
                (response.status === 401 ? 'Email ou mot de passe incorrect.' : 'La requête a échoué.')
            );
            error.status = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    } catch (error) {
        if (!error.status) error.unavailable = true;
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

function isAuthEndpointUnavailable(error) {
    return error.unavailable || [404, 405, 501].includes(error.status);
}

function extractAuthSession(payload) {
    const user = payload.user || payload.utilisateur || payload.data?.user || payload.data?.utilisateur;
    const token = payload.token || payload.access_token || payload.accessToken || payload.data?.token;

    if (!user) {
        throw new Error("La réponse de l'API ne contient pas d'utilisateur.");
    }

    return {
        user: normalizeAuthUser(user),
        token: token || '',
        source: 'api'
    };
}

function renderAuthNavigation() {
    const containers = document.querySelectorAll('[data-auth-nav]');
    const session = readAuthSession();

    containers.forEach(container => {
        if (!session) {
            container.innerHTML = `
                <a class="auth-nav-link" href="connexion.html">
                    <span class="auth-nav-icon" aria-hidden="true">●</span>
                    Connexion
                </a>
            `;
            return;
        }

        const pseudo = authEscapeHtml(session.user.pseudo_site);
        const initial = authEscapeHtml(session.user.pseudo_site.charAt(0).toUpperCase());
        container.innerHTML = `
            <div class="user-menu">
                <button
                    class="user-menu-trigger"
                    type="button"
                    aria-expanded="false"
                    aria-haspopup="menu"
                    data-user-menu-trigger
                >
                    <span class="user-avatar">${initial}</span>
                    <span class="user-menu-name">${pseudo}</span>
                    <span class="user-menu-chevron" aria-hidden="true">▾</span>
                </button>
                <div class="user-menu-dropdown" role="menu" data-user-menu-dropdown hidden>
                    <div class="user-menu-summary">
                        <strong>${pseudo}</strong>
                        <span>${authEscapeHtml(session.user.email)}</span>
                        <span class="session-source">${session.source === 'demo' ? 'Session de démonstration' : 'Compte connecté'}</span>
                    </div>
                    <a href="connexion.html" role="menuitem">Mon espace</a>
                    <button type="button" role="menuitem" data-logout>Se déconnecter</button>
                </div>
            </div>
        `;
    });

    bindUserMenus();
}

function bindUserMenus() {
    document.querySelectorAll('[data-user-menu-trigger]').forEach(trigger => {
        trigger.addEventListener('click', event => {
            event.stopPropagation();
            const dropdown = trigger.parentElement.querySelector('[data-user-menu-dropdown]');
            const willOpen = dropdown.hidden;
            closeUserMenus();
            dropdown.hidden = !willOpen;
            trigger.setAttribute('aria-expanded', String(willOpen));
        });
    });

    document.querySelectorAll('[data-logout]').forEach(button => {
        button.addEventListener('click', handleLogout);
    });
}

function closeUserMenus() {
    document.querySelectorAll('[data-user-menu-dropdown]').forEach(dropdown => {
        dropdown.hidden = true;
    });
    document.querySelectorAll('[data-user-menu-trigger]').forEach(trigger => {
        trigger.setAttribute('aria-expanded', 'false');
    });
}

function showAuthMessage(message, type = 'info') {
    const container = document.getElementById('auth-message');
    if (!container) return;

    container.textContent = message;
    container.className = `auth-message auth-message-${type}`;
    container.hidden = false;
}

function clearAuthMessage() {
    const container = document.getElementById('auth-message');
    if (!container) return;
    container.hidden = true;
    container.textContent = '';
}

function setFormLoading(form, loading) {
    const submit = form.querySelector('[type="submit"]');
    form.querySelectorAll('input, button').forEach(control => {
        control.disabled = loading;
    });
    submit.classList.toggle('is-loading', loading);
    submit.querySelector('span').textContent = loading ? 'Chargement...' : submit.dataset.defaultLabel;
}

function redirectAfterAuthentication() {
    const params = new URLSearchParams(window.location.search);
    const requestedPage = params.get('redirect');
    const safeRedirect = requestedPage && !requestedPage.includes('://') && !requestedPage.startsWith('//')
        ? requestedPage
        : 'index.html';
    window.location.href = safeRedirect;
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('mot_de_passe') || '');
    const remember = data.get('remember') === 'on';

    clearAuthMessage();
    setFormLoading(form, true);

    try {
        const payload = await authRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, mot_de_passe: password })
        });
        saveAuthSession(extractAuthSession(payload), remember);
        showAuthMessage('Connexion réussie. Redirection...', 'success');
        setTimeout(redirectAfterAuthentication, 500);
    } catch (error) {
        if (isAuthEndpointUnavailable(error)) {
            if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
                saveAuthSession({ user: DEMO_ACCOUNT.user, token: '', source: 'demo' }, remember);
                showAuthMessage('Connexion en mode démonstration réussie.', 'success');
                setTimeout(redirectAfterAuthentication, 500);
            } else {
                showAuthMessage(
                    "L'API de connexion n'est pas encore disponible. Utilisez le compte de démonstration indiqué à gauche.",
                    'warning'
                );
            }
        } else {
            showAuthMessage(error.message, 'error');
        }
    } finally {
        setFormLoading(form, false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const pseudo = String(data.get('pseudo_site') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('mot_de_passe') || '');
    const confirmation = String(data.get('confirm_password') || '');

    clearAuthMessage();

    if (password !== confirmation) {
        showAuthMessage('Les deux mots de passe ne correspondent pas.', 'error');
        return;
    }

    setFormLoading(form, true);

    try {
        const payload = await authRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                pseudo_site: pseudo,
                email,
                mot_de_passe: password
            })
        });
        saveAuthSession(extractAuthSession(payload), false);
        showAuthMessage('Compte créé avec succès. Redirection...', 'success');
        setTimeout(redirectAfterAuthentication, 500);
    } catch (error) {
        if (isAuthEndpointUnavailable(error)) {
            saveAuthSession({
                user: {
                    id_utilisateur: `demo-${Date.now()}`,
                    pseudo_site: pseudo,
                    email
                },
                token: '',
                source: 'demo'
            });
            showAuthMessage(
                'Compte créé en mode démonstration. Le mot de passe n’a pas été enregistré.',
                'success'
            );
            setTimeout(redirectAfterAuthentication, 900);
        } else {
            showAuthMessage(error.message, 'error');
        }
    } finally {
        setFormLoading(form, false);
    }
}

async function handleLogout() {
    const session = readAuthSession();
    closeUserMenus();

    if (session?.source === 'api') {
        try {
            await authRequest('/auth/logout', { method: 'POST', body: '{}' });
        } catch (error) {
            // The local session must still be removed if the server is unavailable.
        }
    }

    clearAuthSession();
    renderAuthNavigation();
    renderAuthPageSessionState();

    if (window.location.pathname.endsWith('/connexion.html')) {
        showAuthMessage('Vous êtes maintenant déconnecté.', 'success');
    }
}

async function refreshApiSession() {
    const session = readAuthSession();
    if (!session || session.source !== 'api' || !session.token) return;

    try {
        const payload = await authRequest('/auth/me', { method: 'GET' });
        const user = payload.user || payload.utilisateur || payload.data || payload;
        saveAuthSession(
            {
                ...session,
                user: normalizeAuthUser(user)
            },
            isPersistentAuthSession()
        );
        renderAuthNavigation();
        renderAuthPageSessionState();
    } catch (error) {
        if ([401, 403].includes(error.status)) {
            clearAuthSession();
            renderAuthNavigation();
        }
    }
}

function switchAuthPanel(panelName) {
    clearAuthMessage();
    const isLogin = panelName === 'login';
    document.getElementById('login-panel').hidden = !isLogin;
    document.getElementById('register-panel').hidden = isLogin;

    document.querySelectorAll('[data-auth-tab]').forEach(tab => {
        const active = tab.dataset.authTab === panelName;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
    });

    const hash = isLogin ? 'connexion' : 'inscription';
    history.replaceState(null, '', `#${hash}`);
}

function initPasswordToggles() {
    document.querySelectorAll('[data-password-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            const showPassword = input.type === 'password';
            input.type = showPassword ? 'text' : 'password';
            button.textContent = showPassword ? 'Masquer' : 'Afficher';
        });
    });
}

function renderAuthPageSessionState() {
    const accountPanel = document.getElementById('account-panel');
    const tabs = document.getElementById('auth-tabs');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    if (!accountPanel || !tabs || !loginPanel || !registerPanel) return;

    const session = readAuthSession();
    if (!session) {
        accountPanel.hidden = true;
        tabs.hidden = false;
        switchAuthPanel(window.location.hash === '#inscription' ? 'register' : 'login');
        return;
    }

    tabs.hidden = true;
    loginPanel.hidden = true;
    registerPanel.hidden = true;
    accountPanel.hidden = false;
    accountPanel.querySelector('[data-account-initial]').textContent =
        session.user.pseudo_site.charAt(0).toUpperCase();
    accountPanel.querySelector('[data-account-pseudo]').textContent = session.user.pseudo_site;
    accountPanel.querySelector('[data-account-email]').textContent = session.user.email;
    accountPanel.querySelector('[data-account-group]').textContent =
        Number(session.user.id_groupe) === 1 ? 'Premium' : 'Standard';

    const source = accountPanel.querySelector('[data-account-source]');
    source.textContent = session.source === 'demo' ? 'Compte de démonstration' : 'Compte API';
    source.className = `source-badge account-source source-${session.source === 'demo' ? 'demo' : 'api'}`;
}

function initAuthPage() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (!loginForm || !registerForm) return;

    loginForm.querySelector('[type="submit"]').dataset.defaultLabel = 'Se connecter';
    registerForm.querySelector('[type="submit"]').dataset.defaultLabel = 'Créer mon compte';

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    document.querySelectorAll('[data-auth-tab]').forEach(tab => {
        tab.addEventListener('click', () => switchAuthPanel(tab.dataset.authTab));
    });

    document.getElementById('forgot-password').addEventListener('click', () => {
        showAuthMessage(
            "La récupération de mot de passe sera activée lorsque l'endpoint correspondant sera disponible.",
            'info'
        );
    });
    document.getElementById('account-logout').addEventListener('click', handleLogout);

    initPasswordToggles();

    const session = readAuthSession();
    if (session) {
        showAuthMessage(`Vous êtes connecté en tant que ${session.user.pseudo_site}.`, 'success');
    }
    renderAuthPageSessionState();
}

document.addEventListener('click', closeUserMenus);

document.addEventListener('DOMContentLoaded', () => {
    renderAuthNavigation();
    initAuthPage();
    refreshApiSession();
});

window.addEventListener('hashchange', () => {
    if (!document.getElementById('login-panel')) return;
    renderAuthPageSessionState();
});

window.NYJAuth = {
    getSession: readAuthSession,
    logout: handleLogout
};
