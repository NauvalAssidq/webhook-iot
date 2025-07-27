const express = require('express');
const router = express.Router();
const Articles = require('../models/Article');
const slugify = require('slugify');
const crypto = require('crypto');
const { protectApi, isAdmin } = require('../middleware/auth');
const { validateArticle } = require('../middleware/validators');

// --- Public Routes ---

/**
 * @desc    Get all published articles with filtering, sorting, and pagination.
 * @route   GET /api/articles
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { tag, sortBy, page = 1, limit = 10, featured } = req.query;

        const filter = { status: 'published' };
        if (tag) filter.tags = tag;
        if (featured) filter.isFeatured = true;

        let sort = { createdAt: -1 }; // Default sort: newest first
        if (sortBy === 'views') sort = { viewCount: -1 };

        const articles = await Articles.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('author', 'displayName'); // Attach author's name

        const totalCount = await Articles.countDocuments(filter);

        res.json({
            articles,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalArticles: totalCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @desc    Get a single published article by its unique slug.
 * @route   GET /api/articles/:slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
    try {
        const article = await Articles.findOne({
            $or: [{ 'slug.en': req.params.slug }, { 'slug.id': req.params.slug }],
            status: 'published'
        }).populate('author', 'displayName');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @desc    Increment the view count for an article. Uses a cookie to prevent spam.
 * @route   POST /api/articles/:slug/view
 * @access  Public
 */
router.post('/:slug/view', async (req, res) => {
    try {
        const slug = req.params.slug;
        const viewedArticles = req.cookies.viewed_articles || '';

        // Only increment if the user hasn't viewed this article recently
        if (!viewedArticles.includes(slug)) {
            await Articles.updateOne(
                { $or: [{ 'slug.en': slug }, { 'slug.id': slug }] },
                { $inc: { viewCount: 1 } }
            );
            // Set a cookie that expires in 24 hours
            res.cookie('viewed_articles', `${viewedArticles},${slug}`, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'strict'
            });
        }
        res.status(200).json({ message: 'OK' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- Admin-Only Routes ---

/**
 * @desc    Create a new article. Automatically generates a unique slug.
 * @route   POST /api/articles
 * @access  Private/Admin
 */
router.post('/', protectApi, isAdmin, validateArticle, async (req, res) => {
    try {
        const { title, content, metaDescription, featuredImage, tags, status } = req.body;

        const baseSlugEn = slugify(title.en, { lower: true, strict: true });
        const baseSlugId = slugify(title.id, { lower: true, strict: true });

        let finalSlugEn = baseSlugEn;
        let finalSlugId = baseSlugId;

        // Check for duplicate slugs and append a random string if necessary
        const existingArticle = await Articles.findOne({
            $or: [{ 'slug.en': finalSlugEn }, { 'slug.id': finalSlugId }]
        });

        if (existingArticle) {
            const randomString = crypto.randomBytes(3).toString('hex');
            finalSlugEn = `${baseSlugEn}-${randomString}`;
            finalSlugId = `${baseSlugId}-${randomString}`;
        }

        const newArticle = new Articles({
            title,
            content,
            metaDescription,
            featuredImage,
            tags,
            status,
            slug: {
                en: finalSlugEn,
                id: finalSlugId
            },
            author: req.user.id, // Set author from logged-in admin user
        });

        const createdArticle = await newArticle.save();
        res.status(201).json(createdArticle);
    } catch (error) {
        res.status(400).json({ message: 'Error creating article', error: error.message });
    }
});

/**
 * @desc    Update an existing article by its ID.
 * @route   PUT /api/articles/:id
 * @access  Private/Admin
 */
router.put('/:id', protectApi, isAdmin, validateArticle, async (req, res) => {
    try {
        const article = await Articles.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true,
        });
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    } catch (error) {
        res.status(400).json({ message: 'Error updating article', error: error.message });
    }
});

/**
 * @desc    Delete an article by its ID.
 * @route   DELETE /api/articles/:id
 * @access  Private/Admin
 */
router.delete('/:id', protectApi, isAdmin, async (req, res) => {
    try {
        const article = await Articles.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;