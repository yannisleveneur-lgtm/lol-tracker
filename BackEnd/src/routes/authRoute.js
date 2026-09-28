const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authentifier } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Inscription, connexion et gestion de session (JWT)
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pseudo_site, email, mot_de_passe]
 *             properties:
 *               pseudo_site: { type: string, example: testuser }
 *               email: { type: string, example: test@test.fr }
 *               mot_de_passe: { type: string, example: Test123! }
 *               id_groupe: { type: integer, example: 2 }
 *     responses:
 *       201: { description: Compte créé, renvoie l'utilisateur et un token JWT }
 *       400: { description: Champs manquants }
 *       409: { description: Pseudo ou email déjà utilisé }
 *       422: { description: Groupe inexistant }
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Connexion, renvoie un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, mot_de_passe]
 *             properties:
 *               email: { type: string, example: test@test.fr }
 *               mot_de_passe: { type: string, example: Test123! }
 *     responses:
 *       200: { description: Connexion réussie, renvoie un token }
 *       400: { description: Champs manquants }
 *       401: { description: Email ou mot de passe incorrect }
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Profil du compte connecté
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil de l'utilisateur }
 *       401: { description: Token manquant ou invalide }
 */
router.get('/me', authentifier, authController.me);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion (le client supprime le token)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Déconnexion confirmée }
 *       401: { description: Token manquant ou invalide }
 */
router.post('/logout', authentifier, authController.logout);

module.exports = router;