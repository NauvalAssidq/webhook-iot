const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Akses ditolak. Tidak ada token yang diberikan.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Format token tidak valid.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid.' });
    }
}

module.exports = authMiddleware;