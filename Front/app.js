const API_BASE_URL = window.NYJ_API_BASE_URL || '/api';
const DATA_DRAGON_VERSION = '14.3.1';

document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;

    image.alt = '';
    image.classList.add('image-fallback');
    image.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
}, true);

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizeRegion(region) {
    const value = String(region || 'EUW').toUpperCase();
    if (value.startsWith('EUW')) return 'EUW';
    if (value.startsWith('EUNE')) return 'EUNE';
    if (value.startsWith('NA')) return 'NA';
    if (value.startsWith('KR')) return 'KR';
    if (value.startsWith('JP')) return 'JP';
    if (value.startsWith('BR')) return 'BR';
    if (value.startsWith('LAN')) return 'LAN';
    return value;
}

function asNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getTierFromWinrate(winrate) {
    if (winrate >= 53) return 'S+';
    if (winrate >= 51.5) return 'S';
    if (winrate >= 50) return 'A';
    if (winrate >= 48) return 'B';
    return 'C';
}

function championImageName(name) {
    const aliases = {
        'Lee Sin': 'LeeSin',
        'Kai Sa': 'Kaisa',
        "Kai'Sa": 'Kaisa',
        'Wukong': 'MonkeyKing'
    };
    return aliases[name] || String(name).replace(/[^a-zA-Z0-9]/g, '');
}

function profileUrl(player) {
    const params = new URLSearchParams({
        player: player.game_name,
        tag: player.tag_line || '',
        region: normalizeRegion(player.nom_region)
    });
    if (player.puuid) params.set('puuid', player.puuid);
    return `profile.html?${params.toString()}`;
}

async function fetchJson(path, options = {}) {
    const {
        timeout = 5000,
        auth = false,
        headers: extraHeaders = {},
        body,
        ...fetchOptions
    } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const headers = {
        Accept: 'application/json',
        ...extraHeaders
    };
    const session = window.NYJAuth?.getSession?.();

    if (auth && session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...fetchOptions,
            headers,
            body: body === undefined || typeof body === 'string'
                ? body
                : JSON.stringify(body),
            signal: controller.signal
        });
        const payload = response.status === 204
            ? null
            : await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(
                payload?.erreur || payload?.message || `HTTP ${response.status}`
            );
            error.status = response.status;
            throw error;
        }

        return payload;
    } finally {
        clearTimeout(timer);
    }
}

function normalizePlayer(player) {
    return {
        puuid: player.puuid || player.invocateur_puuid || '',
        game_name: player.game_name || player.name || 'Joueur inconnu',
        tag_line: player.tag_line || player.tag || '',
        nom_region: normalizeRegion(player.nom_region || player.region || 'EUW'),
        niveau: asNumber(player.niveau, 1),
        icone_id: asNumber(player.icone_id, 29),
        solo_rang: player.solo_rang || player.rank || 'UNRANKED',
        solo_division: player.solo_division || '',
        solo_lp: asNumber(player.solo_lp ?? player.lp, 0),
        flex_rang: player.flex_rang || 'UNRANKED',
        flex_division: player.flex_division || '',
        flex_lp: asNumber(player.flex_lp, 0),
        classement: player.classement || player.rank_position || null
    };
}

function normalizeChampion(champion) {
    const winrate = asNumber(champion.winrate, 0);
    return {
        champion: champion.champion || champion.name || champion._id || 'Champion',
        role: String(champion.role || 'all').toLowerCase(),
        winrate,
        totalMatchs: asNumber(champion.totalMatchs ?? champion.matchs ?? champion.games, 0),
        tier: champion.tier || getTierFromWinrate(winrate)
    };
}

function setSourceBadge(elementId, source) {
    const badge = document.getElementById(elementId);
    if (!badge) return;

    const labels = {
        api: 'API connectée',
        error: 'API indisponible'
    };
    badge.textContent = labels[source] || 'Indisponible';
    badge.className = `source-badge source-${source}`;
}

function showPageNotice(message, type = 'info') {
    const notice = document.getElementById('data-status');
    if (!notice) return;

    notice.textContent = message;
    notice.className = `data-status status-${type}`;
    notice.hidden = false;
}

async function getLeaderboard(region) {
    try {
        const params = new URLSearchParams({
            region: normalizeRegion(region),
            sort: 'lp',
            order: 'desc',
            limit: '100'
        });
        const response = await fetchJson(`/invocateurs?${params.toString()}`);
        const rawPlayers = Array.isArray(response) ? response : (response.invocateurs || response.data || []);
        const players = rawPlayers
            .map(normalizePlayer)
            .sort((a, b) => b.solo_lp - a.solo_lp);

        return { data: players, source: 'api' };
    } catch (error) {
        return { data: [], source: 'error', error };
    }
}

async function getChampionStats() {
    try {
        const response = await fetchJson('/matchs/champions/statistiques');
        const rawChampions = Array.isArray(response) ? response : (response.champions || response.data || []);
        return { data: rawChampions.map(normalizeChampion), source: 'api' };
    } catch (error) {
        return { data: [], source: 'error', error };
    }
}

function createPlayerNotFoundError(query) {
    const playerName = `${query.player}${query.tag ? `#${query.tag}` : ''}`;
    const error = new Error(
        `Aucun joueur "${playerName}" n'existe dans la région ${normalizeRegion(query.region)}.`
    );
    error.code = 'PLAYER_NOT_FOUND';
    error.status = 404;
    return error;
}

function playerMatchesQuery(player, query) {
    const sameName = player.game_name.toLowerCase() === query.player.toLowerCase();
    const sameTag = !query.tag
        || player.tag_line.toLowerCase() === query.tag.toLowerCase();
    const sameRegion = normalizeRegion(player.nom_region) === normalizeRegion(query.region);
    return sameName && sameTag && sameRegion;
}

async function getPlayerProfile(query) {
    const searchParams = new URLSearchParams({
        game_name: query.player,
        region: normalizeRegion(query.region)
    });
    if (query.tag) searchParams.set('tag_line', query.tag);

    if (query.puuid) {
        const player = normalizePlayer(
            await fetchJson(`/invocateurs/${encodeURIComponent(query.puuid)}`)
        );
        if (!playerMatchesQuery(player, query)) {
            throw createPlayerNotFoundError(query);
        }
        return { data: player, source: 'api' };
    }

    const response = await fetchJson(`/invocateurs/recherche?${searchParams.toString()}`);
    const rawPlayers = Array.isArray(response)
        ? response
        : (response.invocateurs || response.data || []);
    const summary = rawPlayers
        .map(normalizePlayer)
        .find(player => playerMatchesQuery(player, query));

    if (!summary) {
        throw createPlayerNotFoundError(query);
    }

    const player = summary.puuid
        ? normalizePlayer(
            await fetchJson(`/invocateurs/${encodeURIComponent(summary.puuid)}`)
        )
        : summary;

    if (!playerMatchesQuery(player, query)) {
        throw createPlayerNotFoundError(query);
    }
    return { data: player, source: 'api' };
}

async function getPlayerMatches(player) {
    if (!player.puuid) {
        return { data: [], source: 'api' };
    }

    try {
        const response = await fetchJson(`/matchs/invocateur/${encodeURIComponent(player.puuid)}`);
        const rawMatches = Array.isArray(response) ? response : (response.matchs || response.data || []);
        return { data: rawMatches, source: 'api' };
    } catch (error) {
        if (error.status === 404) {
            return { data: [], source: 'api' };
        }
        return { data: [], source: 'error', error };
    }
}

function renderEmptyTable(tableBody, columnCount, message) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="${columnCount}" class="empty-state">${escapeHtml(message)}</td>
        </tr>
    `;
}

function renderLeaderboardRows(tableBody, players, full = false) {
    tableBody.innerHTML = '';

    if (!players.length) {
        renderEmptyTable(tableBody, full ? 5 : 4, 'Aucun joueur disponible pour cette région.');
        return;
    }

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'clickable-row';
        row.tabIndex = 0;
        row.setAttribute('role', 'link');
        row.addEventListener('click', () => {
            window.location.href = profileUrl(player);
        });
        row.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.location.href = profileUrl(player);
            }
        });

        const playerCell = `
            <td class="player-info">
                <div class="player-icon-placeholder" aria-hidden="true">${escapeHtml(player.game_name.charAt(0))}</div>
                <div>
                    <span class="player-name">${escapeHtml(player.game_name)}</span><br>
                    <span class="player-tag">#${escapeHtml(player.tag_line || '---')}</span>
                </div>
            </td>
        `;

        row.innerHTML = full
            ? `
                <td class="rank-number">#${index + 1}</td>
                ${playerCell}
                <td>${escapeHtml(player.nom_region)}</td>
                <td class="tier-name">${escapeHtml(`${player.solo_rang} ${player.solo_division}`.trim())}</td>
                <td class="lp-tier">${player.solo_lp} LP</td>
            `
            : `
                <td>${index + 1}</td>
                ${playerCell}
                <td class="tier-name">${escapeHtml(`${player.solo_rang} ${player.solo_division}`.trim())}</td>
                <td class="lp-tier">${player.solo_lp} LP</td>
            `;

        tableBody.appendChild(row);
    });
}

function renderChampionTable(tableBody, champions) {
    tableBody.innerHTML = '';

    if (!champions.length) {
        renderEmptyTable(tableBody, 4, 'Aucune statistique de champion disponible.');
        return;
    }

    champions.slice(0, 5).forEach(champion => {
        const row = document.createElement('tr');
        const imageName = championImageName(champion.champion);
        row.innerHTML = `
            <td class="champ-info">
                <img
                    class="champ-icon"
                    src="https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/champion/${encodeURIComponent(imageName)}.png"
                    alt=""
                    loading="lazy"
                >
                <span>${escapeHtml(champion.champion)}</span>
            </td>
            <td class="${champion.tier.includes('S') ? 'tier-s-plus' : ''}">${escapeHtml(champion.tier)}</td>
            <td>${champion.winrate.toFixed(1)}%</td>
            <td>${champion.totalMatchs || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderChampionCards(container, champions, roleFilter) {
    container.innerHTML = '';
    const filtered = roleFilter === 'all'
        ? champions
        : champions.filter(champion => champion.role === roleFilter);

    if (!filtered.length) {
        container.innerHTML = '<p class="empty-state">Aucun champion disponible pour ce rôle.</p>';
        return;
    }

    filtered.forEach(champion => {
        const card = document.createElement('article');
        card.className = 'champion-card';
        const imageName = championImageName(champion.champion);
        card.innerHTML = `
            <img
                class="champ-card-image"
                src="https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/champion/${encodeURIComponent(imageName)}.png"
                alt="Portrait de ${escapeHtml(champion.champion)}"
                loading="lazy"
            >
            <div class="champ-card-name">${escapeHtml(champion.champion)}</div>
            <div class="champ-card-stats">
                <div>Tier<br><span class="${champion.tier.includes('S') ? 'tier-s-plus' : ''}">${escapeHtml(champion.tier)}</span></div>
                <div>Winrate<br><span>${champion.winrate.toFixed(1)}%</span></div>
                <div>Matchs<br><span>${champion.totalMatchs || '-'}</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function formatRank(rank, division) {
    const value = `${rank || 'UNRANKED'} ${division || ''}`.trim();
    return value === 'UNRANKED' ? 'Non classé' : value;
}

function setProfileAvatar(player) {
    const avatar = document.getElementById('profile-avatar');
    const initials = document.getElementById('profile-initials');
    if (!avatar || !initials) return;

    initials.textContent = player.game_name.charAt(0).toUpperCase();
    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/profileicon/${player.icone_id}.png`;
    avatar.style.backgroundImage = `linear-gradient(rgba(10, 20, 40, 0.1), rgba(10, 20, 40, 0.1)), url("${imageUrl}")`;
}

function renderProfile(player) {
    document.getElementById('display-player-name').textContent = player.game_name;
    document.getElementById('display-player-tag').textContent = player.tag_line ? `#${player.tag_line}` : '';
    document.getElementById('profile-region').textContent = player.nom_region;
    document.getElementById('profile-level').textContent = player.niveau;
    document.getElementById('profile-rank-position').textContent = player.classement ? `#${player.classement}` : 'Non calculé';
    document.getElementById('solo-tier').textContent = formatRank(player.solo_rang, player.solo_division);
    document.getElementById('solo-lp').textContent = `${player.solo_lp} LP`;
    document.getElementById('flex-tier').textContent = formatRank(player.flex_rang, player.flex_division);
    document.getElementById('flex-lp').textContent = `${player.flex_lp} LP`;
    setProfileAvatar(player);
}

function renderProfileError(error, query) {
    const content = document.getElementById('profile-content');
    const errorPanel = document.getElementById('profile-error');
    const errorTitle = document.getElementById('profile-error-title');
    const errorMessage = document.getElementById('profile-error-message');
    if (!content || !errorPanel || !errorTitle || !errorMessage) return;

    const notFound = error.code === 'PLAYER_NOT_FOUND' || error.status === 404;
    content.hidden = true;
    errorPanel.hidden = false;
    errorTitle.textContent = notFound ? 'Joueur introuvable' : 'Service indisponible';
    errorMessage.textContent = notFound
        ? createPlayerNotFoundError(query).message
        : 'Impossible de vérifier ce joueur pour le moment. Réessayez lorsque l’API est disponible.';

    showPageNotice(
        notFound
            ? 'La recherche ne correspond à aucun invocateur enregistré dans cette région.'
            : 'La recherche n’a pas pu être vérifiée auprès de l’API.',
        notFound ? 'warning' : 'error'
    );
}

function showFavoriteMessage(message, type = 'info') {
    const container = document.getElementById('favorite-message');
    if (!container) return;

    container.textContent = message;
    container.className = `favorite-message favorite-message-${type}`;
    container.hidden = !message;
}

async function getUserFavorites(session) {
    if (!session?.token || !session.user?.id_utilisateur) {
        return [];
    }
    const response = await fetchJson(
        `/favoris/utilisateur/${encodeURIComponent(session.user.id_utilisateur)}`,
        { auth: true }
    );
    return Array.isArray(response) ? response : (response.favoris || []);
}

function setFavoriteButtonState(button, favorite) {
    const isFavorite = Boolean(favorite);
    button.dataset.favoriteId = favorite?.id_favori || '';
    button.classList.toggle('is-favorite', isFavorite);
    button.textContent = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    button.setAttribute('aria-pressed', String(isFavorite));
}

async function initProfileFavorite(player) {
    const button = document.getElementById('favorite-toggle');
    if (!button) return;

    button.hidden = false;
    if (!player.puuid) {
        button.disabled = true;
        button.textContent = 'Favori indisponible';
        return;
    }

    const session = window.NYJAuth?.getSession?.();
    if (!session) {
        button.textContent = 'Se connecter pour ajouter';
        button.addEventListener('click', () => {
            const currentPage = `${window.location.pathname.split('/').pop()}${window.location.search}`;
            window.location.href =
                `connexion.html?redirect=${encodeURIComponent(currentPage)}`;
        });
        return;
    }

    if (!session.token) {
        button.disabled = true;
        button.textContent = 'Favoris indisponibles en mode démo';
        showFavoriteMessage(
            'Reconnectez-vous à l’API pour synchroniser les favoris.',
            'warning'
        );
        return;
    }

    button.disabled = true;
    button.textContent = 'Chargement des favoris...';

    try {
        let favorites = await getUserFavorites(session);
        let currentFavorite = favorites.find(
            favorite => favorite.invocateur_puuid === player.puuid
        ) || null;
        setFavoriteButtonState(button, currentFavorite);
        button.disabled = false;

        button.addEventListener('click', async () => {
            button.disabled = true;
            showFavoriteMessage('', 'info');
            try {
                if (currentFavorite) {
                    await fetchJson(`/favoris/${currentFavorite.id_favori}`, {
                        method: 'DELETE',
                        auth: true
                    });
                    currentFavorite = null;
                    showFavoriteMessage('Invocateur retiré de vos favoris.', 'success');
                } else {
                    await fetchJson('/favoris', {
                        method: 'POST',
                        auth: true,
                        body: { invocateur_puuid: player.puuid }
                    });
                    favorites = await getUserFavorites(session);
                    currentFavorite = favorites.find(
                        favorite => favorite.invocateur_puuid === player.puuid
                    ) || null;
                    showFavoriteMessage('Invocateur ajouté à vos favoris.', 'success');
                }
                setFavoriteButtonState(button, currentFavorite);
            } catch (error) {
                showFavoriteMessage(error.message, 'error');
            } finally {
                button.disabled = false;
            }
        });
    } catch (error) {
        button.disabled = true;
        button.textContent = 'Favoris indisponibles';
        showFavoriteMessage(error.message, 'error');
    }
}

function findParticipant(match, puuid) {
    if (match.participant) return match.participant;
    if (!Array.isArray(match.participants)) return {};
    return match.participants.find(participant => participant.puuid === puuid) || match.participants[0] || {};
}

function relativeTime(timestamp) {
    const numeric = asNumber(timestamp, Date.now());
    const milliseconds = numeric < 1000000000000 ? numeric * 1000 : numeric;
    const elapsedHours = Math.max(1, Math.round((Date.now() - milliseconds) / 3600000));
    if (elapsedHours < 24) return `Il y a ${elapsedHours}h`;
    return `Il y a ${Math.round(elapsedHours / 24)}j`;
}

function renderMatches(container, matches, player) {
    container.innerHTML = '';

    if (!matches.length) {
        container.innerHTML = '<p class="empty-state">Aucun match récent disponible.</p>';
        return;
    }

    matches.forEach(match => {
        const participant = findParticipant(match, player.puuid);
        const kills = asNumber(participant.kills, 0);
        const deaths = asNumber(participant.deaths, 0);
        const assists = asNumber(participant.assists, 0);
        const ratio = ((kills + assists) / Math.max(deaths, 1)).toFixed(2);
        const won = participant.win === true;
        const champion = participant.championName || 'Champion';
        const imageName = championImageName(champion);

        const card = document.createElement('article');
        card.className = `match-card ${won ? 'match-win' : 'match-loss'}`;
        card.innerHTML = `
            <div class="match-info">
                <span class="match-result">${won ? 'Victoire' : 'Défaite'}</span>
                <span class="match-time">${escapeHtml(relativeTime(match.gameCreation))}</span>
                <span class="match-mode">${escapeHtml(match.gameMode || 'Partie')}</span>
            </div>
            <div class="match-champ">
                <img
                    class="champ-icon"
                    src="https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/champion/${encodeURIComponent(imageName)}.png"
                    alt=""
                    loading="lazy"
                >
                <span class="champ-name">${escapeHtml(champion)}</span>
            </div>
            <div class="match-stats">
                <p class="kda">${kills} / <span class="deaths">${deaths}</span> / ${assists}</p>
                <p class="kda-ratio">${ratio} KDA</p>
            </div>
            <div class="match-id">${escapeHtml(match.matchId || '')}</div>
        `;
        container.appendChild(card);
    });
}

async function initSearch() {
    const searchForm = document.getElementById('search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        const region = normalizeRegion(document.getElementById('region').value);
        const rawSearch = document.getElementById('summoner-name').value.trim();
        const [player, tag = ''] = rawSearch.split('#').map(value => value.trim());

        if (!player) return;

        const params = new URLSearchParams({ player, tag, region });
        window.location.href = `profile.html?${params.toString()}`;
    });
}

async function initHomeLeaderboard() {
    const tableBody = document.getElementById('player-leaderboard-body');
    const tabs = document.querySelectorAll('#home-region-tabs .tab');
    if (!tableBody) return;

    const loadRegion = async region => {
        renderEmptyTable(tableBody, 4, 'Chargement du classement...');
        const result = await getLeaderboard(region);
        renderLeaderboardRows(tableBody, result.data.slice(0, 5));
        setSourceBadge('leaderboard-source', result.source);
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            loadRegion(tab.dataset.region);
        });
    });

    await loadRegion('EUW');
}

async function initHomeChampions() {
    const tableBody = document.getElementById('champion-tierlist-body');
    if (!tableBody) return;

    renderEmptyTable(tableBody, 4, 'Chargement des statistiques...');
    const result = await getChampionStats();
    renderChampionTable(tableBody, result.data);
    setSourceBadge('champions-home-source', result.source);
}

async function initFullLeaderboard() {
    const tableBody = document.getElementById('full-leaderboard-body');
    const tabs = document.querySelectorAll('#full-region-tabs .tab');
    if (!tableBody) return;

    const loadRegion = async region => {
        renderEmptyTable(tableBody, 5, 'Chargement du classement...');
        const result = await getLeaderboard(region);
        renderLeaderboardRows(tableBody, result.data, true);
        setSourceBadge('full-leaderboard-source', result.source);
        showPageNotice(
            result.source === 'api'
                ? 'Le classement affiché provient de MySQL via l’API.'
                : 'API indisponible : le classement ne peut pas être chargé.',
            result.source === 'api' ? 'success' : 'error'
        );
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            loadRegion(tab.dataset.region);
        });
    });

    await loadRegion('EUW');
}

async function initChampionsPage() {
    const container = document.getElementById('champions-grid');
    const roleButtons = document.querySelectorAll('.role-btn');
    if (!container) return;

    container.innerHTML = '<p class="empty-state">Chargement des champions...</p>';
    const result = await getChampionStats();
    let activeRole = 'all';
    renderChampionCards(container, result.data, activeRole);
    setSourceBadge('champions-source', result.source);
    showPageNotice(
        result.source === 'api'
            ? 'Les statistiques sont calculées par une agrégation MongoDB.'
            : 'API indisponible : les statistiques ne peuvent pas être chargées.',
        result.source === 'api' ? 'success' : 'error'
    );

    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            roleButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            activeRole = button.dataset.role;
            renderChampionCards(container, result.data, activeRole);
        });
    });
}

async function initProfilePage() {
    const profileName = document.getElementById('display-player-name');
    if (!profileName) return;

    const urlParams = new URLSearchParams(window.location.search);
    const query = {
        player: urlParams.get('player') || 'Faker',
        tag: urlParams.get('tag') || '',
        region: normalizeRegion(urlParams.get('region') || 'KR'),
        puuid: urlParams.get('puuid') || ''
    };

    profileName.textContent = 'Chargement...';
    const refreshButton = document.getElementById('refresh-profile');
    refreshButton.addEventListener('click', () => window.location.reload());

    try {
        const profileResult = await getPlayerProfile(query);
        renderProfile(profileResult.data);
        setSourceBadge('profile-source', profileResult.source);
        await initProfileFavorite(profileResult.data);

        const matchesResult = await getPlayerMatches(profileResult.data);
        renderMatches(
            document.getElementById('match-history-list'),
            matchesResult.data,
            profileResult.data
        );
        setSourceBadge('matches-source', matchesResult.source);

        showPageNotice(
            matchesResult.source === 'api'
                ? 'Profil SQL et historique MongoDB chargés depuis l’API.'
                : 'Le profil SQL est chargé, mais l’historique MongoDB est indisponible.',
            matchesResult.source === 'api' ? 'success' : 'warning'
        );
    } catch (error) {
        renderProfileError(error, query);
    }
}

function renderAccountFavorites(container, favorites) {
    container.innerHTML = '';

    if (!favorites.length) {
        container.innerHTML = `
            <p class="account-favorites-empty">
                Aucun favori. Ouvrez un profil joueur pour en ajouter un.
            </p>
        `;
        return;
    }

    favorites.forEach(favorite => {
        const player = normalizePlayer(favorite);
        const item = document.createElement('article');
        item.className = 'account-favorite-item';
        item.innerHTML = `
            <a class="account-favorite-link" href="${profileUrl(player)}">
                <span
                    class="account-favorite-icon"
                    style="background-image: url('https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/profileicon/${player.icone_id}.png')"
                    aria-hidden="true"
                ></span>
                <span>
                    <strong>${escapeHtml(player.game_name)}#${escapeHtml(player.tag_line)}</strong>
                    <small>${escapeHtml(formatRank(player.solo_rang, player.solo_division))} · ${player.solo_lp} LP</small>
                </span>
            </a>
            <button
                class="account-favorite-remove"
                type="button"
                data-favorite-id="${favorite.id_favori}"
                aria-label="Retirer ${escapeHtml(player.game_name)} des favoris"
            >
                Retirer
            </button>
        `;
        container.appendChild(item);
    });
}

async function initAccountFavorites() {
    const container = document.getElementById('account-favorites-list');
    const count = document.querySelector('[data-favorite-count]');
    if (!container || !count) return;

    const session = window.NYJAuth?.getSession?.();
    if (!session) return;
    if (!session.token) {
        container.innerHTML = `
            <p class="account-favorites-empty">
                Les favoris nécessitent une session API active.
            </p>
        `;
        return;
    }

    const refresh = async () => {
        container.innerHTML = '<p class="account-favorites-empty">Chargement...</p>';
        const favorites = await getUserFavorites(session);
        count.textContent = `${favorites.length} / 10`;
        renderAccountFavorites(container, favorites);

        container.querySelectorAll('[data-favorite-id]').forEach(button => {
            button.addEventListener('click', async () => {
                button.disabled = true;
                try {
                    await fetchJson(`/favoris/${button.dataset.favoriteId}`, {
                        method: 'DELETE',
                        auth: true
                    });
                    await refresh();
                } catch (error) {
                    container.innerHTML = `
                        <p class="account-favorites-error">${escapeHtml(error.message)}</p>
                    `;
                }
            });
        });
    };

    try {
        await refresh();
    } catch (error) {
        container.innerHTML = `
            <p class="account-favorites-error">${escapeHtml(error.message)}</p>
        `;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        initSearch(),
        initHomeLeaderboard(),
        initHomeChampions(),
        initFullLeaderboard(),
        initChampionsPage(),
        initProfilePage(),
        initAccountFavorites()
    ]);
});
