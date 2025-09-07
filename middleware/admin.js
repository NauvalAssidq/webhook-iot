function adminMiddleware(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Memerlukan hak admin.' });
    }
}

module.exports = adminMiddleware;