const jwt = require('jsonwebtoken');

const authentifier = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Format attendu : "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erreur: 'Token manquant ou mal formé' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // TokenExpiredError ou JsonWebTokenError
        return res.status(401).json({ erreur: 'Token invalide ou expiré' });
    }
};

module.exports = { authentifier };
