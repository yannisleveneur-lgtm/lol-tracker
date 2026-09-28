// =====================================================================
// SCRIPT D'INITIALISATION MongoDB - collection "matchs"
// Format proche de l'API Riot Games : matchId, gameCreation, participants.
// Le fichier est lance automatiquement par Docker au premier demarrage
// du conteneur MongoDB grace au montage dans /docker-entrypoint-initdb.d.
// Les puuid correspondent aux invocateurs du jeu de donnees SQL.
// =====================================================================

db = db.getSiblingDB('lol_nosql_db');
db.matchs.drop();

db.matchs.insertMany([
    {
        matchId: 'EUW1_001',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 1834,
        gameCreation: 1781121600,
        participants: [
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'Azir', role: 'mid', teamId: 100, win: true, kills: 8, deaths: 2, assists: 11 },
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Syndra', role: 'mid', teamId: 200, win: false, kills: 5, deaths: 6, assists: 4 }
        ]
    },
    {
        matchId: 'EUW1_002',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 2102,
        gameCreation: 1781208000,
        participants: [
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'Ahri', role: 'mid', teamId: 100, win: true, kills: 12, deaths: 3, assists: 7 },
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Azir', role: 'mid', teamId: 200, win: false, kills: 7, deaths: 8, assists: 6 }
        ]
    },
    {
        matchId: 'EUW1_003',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 1567,
        gameCreation: 1781290800,
        participants: [
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'Azir', role: 'mid', teamId: 200, win: false, kills: 4, deaths: 5, assists: 9 },
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Orianna', role: 'mid', teamId: 100, win: true, kills: 9, deaths: 2, assists: 12 }
        ]
    },
    {
        matchId: 'EUW1_004',
        region: 'EUW',
        gameMode: 'CLASSIC',
        gameDuration: 1923,
        gameCreation: 1781366400,
        participants: [
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Syndra', role: 'mid', teamId: 100, win: true, kills: 11, deaths: 4, assists: 8 },
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'LeBlanc', role: 'mid', teamId: 200, win: false, kills: 6, deaths: 7, assists: 5 }
        ]
    },
    {
        matchId: 'EUW1_005',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 2456,
        gameCreation: 1781380800,
        participants: [
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'Ahri', role: 'mid', teamId: 100, win: true, kills: 10, deaths: 1, assists: 14 },
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Orianna', role: 'mid', teamId: 200, win: false, kills: 8, deaths: 9, assists: 7 }
        ]
    },
    {
        matchId: 'KR_006',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 2014,
        gameCreation: 1749216000,
        participants: [
            { puuid: 'puuid_chovy', gameName: 'Chovy', championName: 'Yone', role: 'mid', teamId: 100, win: true, kills: 13, deaths: 2, assists: 6 },
            { puuid: 'puuid_showmaker', gameName: 'ShowMaker', championName: 'LeBlanc', role: 'mid', teamId: 200, win: false, kills: 6, deaths: 5, assists: 8 },
            { puuid: 'puuid_keria', gameName: 'Keria', championName: 'Rakan', role: 'support', teamId: 100, win: true, kills: 1, deaths: 3, assists: 21 }
        ]
    },
    {
        matchId: 'KR_007',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 1768,
        gameCreation: 1749302400,
        participants: [
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'Orianna', role: 'mid', teamId: 100, win: true, kills: 7, deaths: 1, assists: 15 },
            { puuid: 'puuid_viper', gameName: 'Viper', championName: 'Aphelios', role: 'adc', teamId: 100, win: true, kills: 11, deaths: 2, assists: 9 },
            { puuid: 'puuid_chovy', gameName: 'Chovy', championName: 'Azir', role: 'mid', teamId: 200, win: false, kills: 5, deaths: 4, assists: 5 }
        ]
    },
    {
        matchId: 'KR_008',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 2291,
        gameCreation: 1749388800,
        participants: [
            { puuid: 'puuid_showmaker', gameName: 'ShowMaker', championName: 'Syndra', role: 'mid', teamId: 100, win: true, kills: 10, deaths: 4, assists: 10 },
            { puuid: 'puuid_keria', gameName: 'Keria', championName: 'Thresh', role: 'support', teamId: 100, win: true, kills: 0, deaths: 2, assists: 24 },
            { puuid: 'puuid_faker', gameName: 'Faker', championName: 'Taliyah', role: 'mid', teamId: 200, win: false, kills: 4, deaths: 6, assists: 8 }
        ]
    },
    {
        matchId: 'EUW1_009',
        region: 'EUW',
        gameMode: 'CLASSIC',
        gameDuration: 1884,
        gameCreation: 1749475200,
        participants: [
            { puuid: 'puuid_hanssama', gameName: 'HansSama', championName: 'Draven', role: 'adc', teamId: 100, win: true, kills: 14, deaths: 3, assists: 5 },
            { puuid: 'puuid_rekkles', gameName: 'Rekkles', championName: 'Jinx', role: 'adc', teamId: 200, win: false, kills: 7, deaths: 6, assists: 7 },
            { puuid: 'puuid_jankos', gameName: 'Jankos', championName: 'Lee Sin', role: 'jungle', teamId: 100, win: true, kills: 5, deaths: 4, assists: 17 }
        ]
    },
    {
        matchId: 'EUW1_010',
        region: 'EUW',
        gameMode: 'CLASSIC',
        gameDuration: 2137,
        gameCreation: 1749561600,
        participants: [
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Sylas', role: 'mid', teamId: 100, win: true, kills: 9, deaths: 5, assists: 13 },
            { puuid: 'puuid_perkz', gameName: 'Perkz', championName: 'Tristana', role: 'mid', teamId: 200, win: false, kills: 8, deaths: 7, assists: 6 },
            { puuid: 'puuid_demo_ahri', gameName: 'AhriEnjoyer', championName: 'Ahri', role: 'mid', teamId: 100, win: true, kills: 6, deaths: 4, assists: 12 }
        ]
    },
    {
        matchId: 'EUW1_011',
        region: 'EUW',
        gameMode: 'CLASSIC',
        gameDuration: 1602,
        gameCreation: 1749648000,
        participants: [
            { puuid: 'puuid_jankos', gameName: 'Jankos', championName: 'Sejuani', role: 'jungle', teamId: 100, win: true, kills: 3, deaths: 2, assists: 19 },
            { puuid: 'puuid_demo_yasuo', gameName: 'YasuoMain99', championName: 'Yasuo', role: 'mid', teamId: 200, win: false, kills: 5, deaths: 9, assists: 3 },
            { puuid: 'puuid_demo_jinx', gameName: 'JinxCarry', championName: 'Jinx', role: 'adc', teamId: 100, win: true, kills: 12, deaths: 3, assists: 8 }
        ]
    },
    {
        matchId: 'NA1_012',
        region: 'NA',
        gameMode: 'CLASSIC',
        gameDuration: 1976,
        gameCreation: 1749734400,
        participants: [
            { puuid: 'puuid_sniper', gameName: 'Sniper', championName: 'Riven', role: 'top', teamId: 100, win: true, kills: 12, deaths: 4, assists: 6 },
            { puuid: 'puuid_doublelift', gameName: 'Doublelift', championName: 'Lucian', role: 'adc', teamId: 100, win: true, kills: 9, deaths: 3, assists: 11 },
            { puuid: 'puuid_bjergsen', gameName: 'Bjergsen', championName: 'Zilean', role: 'mid', teamId: 200, win: false, kills: 2, deaths: 5, assists: 14 }
        ]
    },
    {
        matchId: 'NA1_013',
        region: 'NA',
        gameMode: 'CLASSIC',
        gameDuration: 2420,
        gameCreation: 1749820800,
        participants: [
            { puuid: 'puuid_jojo', gameName: 'jojopyun', championName: 'Akali', role: 'mid', teamId: 100, win: true, kills: 15, deaths: 6, assists: 5 },
            { puuid: 'puuid_demo_lux', gameName: 'LuxSupport', championName: 'Lux', role: 'support', teamId: 100, win: true, kills: 4, deaths: 4, assists: 18 },
            { puuid: 'puuid_doublelift', gameName: 'Doublelift', championName: 'Vayne', role: 'adc', teamId: 200, win: false, kills: 8, deaths: 8, assists: 7 }
        ]
    },
    {
        matchId: 'EUNE_014',
        region: 'EUNE',
        gameMode: 'CLASSIC',
        gameDuration: 1869,
        gameCreation: 1749907200,
        participants: [
            { puuid: 'puuid_inspired', gameName: 'Inspired', championName: 'Viego', role: 'jungle', teamId: 100, win: true, kills: 8, deaths: 2, assists: 16 },
            { puuid: 'puuid_jankos_eune', gameName: 'JankosEUNE', championName: 'Elise', role: 'jungle', teamId: 200, win: false, kills: 7, deaths: 6, assists: 9 },
            { puuid: 'puuid_perkz', gameName: 'Perkz', championName: 'Azir', role: 'mid', teamId: 100, win: true, kills: 6, deaths: 3, assists: 12 }
        ]
    },
    {
        matchId: 'JP1_015',
        region: 'JP',
        gameMode: 'CLASSIC',
        gameDuration: 2041,
        gameCreation: 1749993600,
        participants: [
            { puuid: 'puuid_evi', gameName: 'Evi', championName: 'Gnar', role: 'top', teamId: 100, win: true, kills: 6, deaths: 2, assists: 13 },
            { puuid: 'puuid_yutapon', gameName: 'Yutapon', championName: 'Xayah', role: 'adc', teamId: 100, win: true, kills: 10, deaths: 3, assists: 8 },
            { puuid: 'puuid_robo', gameName: 'Robo', championName: 'Kennen', role: 'top', teamId: 200, win: false, kills: 4, deaths: 5, assists: 7 }
        ]
    },
    {
        matchId: 'BR1_016',
        region: 'BR',
        gameMode: 'CLASSIC',
        gameDuration: 2198,
        gameCreation: 1750080000,
        participants: [
            { puuid: 'puuid_robo', gameName: 'Robo', championName: 'Renekton', role: 'top', teamId: 100, win: true, kills: 7, deaths: 4, assists: 10 },
            { puuid: 'puuid_titan', gameName: 'TitaN', championName: 'KaiSa', role: 'adc', teamId: 100, win: true, kills: 13, deaths: 3, assists: 9 },
            { puuid: 'puuid_yutapon', gameName: 'Yutapon', championName: 'Ezreal', role: 'adc', teamId: 200, win: false, kills: 9, deaths: 7, assists: 5 }
        ]
    },
    {
        matchId: 'LAN_017',
        region: 'LAN',
        gameMode: 'CLASSIC',
        gameDuration: 1911,
        gameCreation: 1750166400,
        participants: [
            { puuid: 'puuid_seiya', gameName: 'Seiya', championName: 'Viktor', role: 'mid', teamId: 100, win: true, kills: 8, deaths: 3, assists: 14 },
            { puuid: 'puuid_oddie', gameName: 'Oddie', championName: 'Jarvan IV', role: 'jungle', teamId: 100, win: true, kills: 4, deaths: 5, assists: 21 },
            { puuid: 'puuid_jojo', gameName: 'jojopyun', championName: 'Leblanc', role: 'mid', teamId: 200, win: false, kills: 7, deaths: 8, assists: 6 }
        ]
    },
    {
        matchId: 'EUW1_018',
        region: 'EUW',
        gameMode: 'CLASSIC',
        gameDuration: 1735,
        gameCreation: 1750252800,
        participants: [
            { puuid: 'puuid_rekkles', gameName: 'Rekkles', championName: 'Sivir', role: 'adc', teamId: 100, win: true, kills: 5, deaths: 1, assists: 16 },
            { puuid: 'puuid_hanssama', gameName: 'HansSama', championName: 'Kalista', role: 'adc', teamId: 200, win: false, kills: 8, deaths: 5, assists: 4 },
            { puuid: 'puuid_demo_ahri', gameName: 'AhriEnjoyer', championName: 'Ahri', role: 'mid', teamId: 100, win: true, kills: 7, deaths: 2, assists: 9 }
        ]
    },
    {
        matchId: 'NA1_019',
        region: 'NA',
        gameMode: 'ARAM',
        gameDuration: 1214,
        gameCreation: 1750339200,
        participants: [
            { puuid: 'puuid_bjergsen', gameName: 'Bjergsen', championName: 'Syndra', role: 'mid', teamId: 100, win: true, kills: 15, deaths: 7, assists: 22 },
            { puuid: 'puuid_demo_lux', gameName: 'LuxSupport', championName: 'Lux', role: 'support', teamId: 100, win: true, kills: 9, deaths: 6, assists: 28 },
            { puuid: 'puuid_sniper', gameName: 'Sniper', championName: 'Fiora', role: 'top', teamId: 200, win: false, kills: 13, deaths: 10, assists: 11 }
        ]
    },
    {
        matchId: 'KR_020',
        region: 'KR',
        gameMode: 'CLASSIC',
        gameDuration: 2325,
        gameCreation: 1750425600,
        participants: [
            { puuid: 'puuid_chovy', gameName: 'Chovy', championName: 'Corki', role: 'mid', teamId: 100, win: true, kills: 11, deaths: 2, assists: 10 },
            { puuid: 'puuid_viper', gameName: 'Viper', championName: 'KaiSa', role: 'adc', teamId: 100, win: true, kills: 12, deaths: 4, assists: 7 },
            { puuid: 'puuid_keria', gameName: 'Keria', championName: 'Nautilus', role: 'support', teamId: 200, win: false, kills: 1, deaths: 7, assists: 13 }
        ]
    },
    {
        matchId: 'BR1_021',
        region: 'BR',
        gameMode: 'CLASSIC',
        gameDuration: 1819,
        gameCreation: 1750512000,
        participants: [
            { puuid: 'puuid_titan', gameName: 'TitaN', championName: 'Zeri', role: 'adc', teamId: 100, win: true, kills: 16, deaths: 2, assists: 6 },
            { puuid: 'puuid_robo', gameName: 'Robo', championName: 'Aatrox', role: 'top', teamId: 100, win: true, kills: 9, deaths: 3, assists: 12 },
            { puuid: 'puuid_oddie', gameName: 'Oddie', championName: 'Lee Sin', role: 'jungle', teamId: 200, win: false, kills: 4, deaths: 8, assists: 10 }
        ]
    },
    {
        matchId: 'EUW1_022',
        region: 'EUW',
        gameMode: 'CLASSIC',
        gameDuration: 2088,
        gameCreation: 1750598400,
        participants: [
            { puuid: 'puuid_demo_jinx', gameName: 'JinxCarry', championName: 'Jinx', role: 'adc', teamId: 100, win: true, kills: 17, deaths: 5, assists: 8 },
            { puuid: 'puuid_demo_yasuo', gameName: 'YasuoMain99', championName: 'Yasuo', role: 'mid', teamId: 100, win: true, kills: 10, deaths: 6, assists: 7 },
            { puuid: 'puuid_caps', gameName: 'Caps', championName: 'Azir', role: 'mid', teamId: 200, win: false, kills: 6, deaths: 6, assists: 11 }
        ]
    },
    {
        matchId: 'LAN_023',
        region: 'LAN',
        gameMode: 'CLASSIC',
        gameDuration: 2001,
        gameCreation: 1750684800,
        participants: [
            { puuid: 'puuid_seiya', gameName: 'Seiya', championName: 'Ahri', role: 'mid', teamId: 100, win: true, kills: 10, deaths: 3, assists: 12 },
            { puuid: 'puuid_oddie', gameName: 'Oddie', championName: 'Maokai', role: 'jungle', teamId: 100, win: true, kills: 2, deaths: 2, assists: 25 },
            { puuid: 'puuid_inspired', gameName: 'Inspired', championName: 'Graves', role: 'jungle', teamId: 200, win: false, kills: 9, deaths: 7, assists: 5 }
        ]
    },
    {
        matchId: 'JP1_024',
        region: 'JP',
        gameMode: 'CLASSIC',
        gameDuration: 1694,
        gameCreation: 1750771200,
        participants: [
            { puuid: 'puuid_evi', gameName: 'Evi', championName: 'Kled', role: 'top', teamId: 100, win: true, kills: 8, deaths: 3, assists: 9 },
            { puuid: 'puuid_yutapon', gameName: 'Yutapon', championName: 'Varus', role: 'adc', teamId: 100, win: true, kills: 11, deaths: 2, assists: 10 },
            { puuid: 'puuid_demo_lux', gameName: 'LuxSupport', championName: 'Lux', role: 'support', teamId: 200, win: false, kills: 3, deaths: 8, assists: 15 }
        ]
    }
]);

db.matchs.createIndex({ matchId: 1 }, { unique: true });
db.matchs.createIndex({ 'participants.puuid': 1, gameCreation: -1 });
db.matchs.createIndex({ 'participants.championName': 1 });

print('Collection matchs initialisee : ' + db.matchs.countDocuments() + ' matchs inseres.');
