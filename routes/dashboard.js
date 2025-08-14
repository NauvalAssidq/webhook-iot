// back-end/routes/dashboard.js

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const { protectApi, isAdmin } = require('../middleware/auth');

// Apply security to all routes in this file
router.use(protectApi, isAdmin);

/**
 * @desc    Get aggregated statistics for the admin dashboard
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
router.get('/stats', async (req, res) => {
    try {
        // Perform multiple database operations in parallel for speed
        const totalArticlesPromise = Article.countDocuments();
        const totalUsersPromise = User.countDocuments();
        const totalViewsPromise = Article.aggregate([
            {
                $group: {
                    _id: null, // Group all documents into one
                    totalViews: { $sum: '$viewCount' } // Sum up the viewCount field
                }
            }
        ]);
        const recentArticlesPromise = Article.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('title status updatedAt'); // Select only the fields we need

        // Wait for all promises to resolve
        const [
            totalArticles,
            totalUsers,
            totalViewsResult,
            recentArticles
        ] = await Promise.all([
            totalArticlesPromise,
            totalUsersPromise,
            totalViewsPromise,
            recentArticlesPromise
        ]);

        // Extract the total views from the aggregation result
        const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

        // Send the combined data back to the frontend
        res.json({
            totalArticles,
            totalUsers,
            totalViews,
            recentArticles
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;