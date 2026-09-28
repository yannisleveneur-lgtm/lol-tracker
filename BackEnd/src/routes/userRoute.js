const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authentifier } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Utilisateurs
 *   description: CRUD des comptes utilisateurs (SQL)
 */

/**
 * @openapi
 * /api/utilisateurs:
 *   get:
 *     summary: Liste paginée des utilisateurs
 *     tags: [Utilisateurs]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Liste des utilisateurs }
 *   post:
 *     summary: Crée un utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pseudo_site, email, mot_de_passe]
 *             properties:
 *               pseudo_site: { type: string, example: nouveau }
 *               email: { type: string, example: nouveau@test.fr }
 *               mot_de_passe: { type: string, example: Test123! }
 *               id_groupe: { type: integer, example: 2 }
 *     responses:
 *       201: { description: Utilisateur créé }
 *       400: { description: Champs manquants }
 *       409: { description: Pseudo ou email déjà utilisé }
 *       422: { description: Groupe inexistant }
 */
router.get('/', userController.getAll);

/**
 * @openapi
 * /api/utilisateurs/{id}:
 *   get:
 *     summary: Détail d'un utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer, example: 1 } }
 *     responses:
 *       200: { description: Détail de l'utilisateur }
 *       404: { description: Utilisateur introuvable }
 *   put:
 *     summary: Met à jour un utilisateur
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer, example: 1 } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pseudo_site, email]
 *             properties:
 *               pseudo_site: { type: string, example: modifie }
 *               email: { type: string, example: modifie@test.fr }
 *     responses:
 *       200: { description: Utilisateur mis à jour }
 *       400: { description: Champs manquants }
 *       404: { description: Utilisateur introuvable }
 *       409: { description: Pseudo ou email déjà utilisé }
 *   delete:
 *     summary: Supprime un utilisateur (procédure transactionnelle sp_supprimer_compte)
 *     tags: [Utilisateurs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer, example: 1 } }
 *     responses:
 *       204: { description: Utilisateur supprimé }
 *       404: { description: Utilisateur introuvable }
 */
router.get('/:id', userController.getOne);
router.post('/', userController.create);
router.put('/:id', authentifier, userController.update);
router.delete('/:id', authentifier, userController.remove);

module.exports = router;