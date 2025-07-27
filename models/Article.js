const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    // Multilingual fields for SEO
    title: {
        en: { type: String, required: true, trim: true },
        id: { type: String, required: true, trim: true }
    },
    content: {
        en: { type: String, required: true },
        id: { type: String, required: true }
    },
    metaDescription: {
        en: { type: String, required: true },
        id: { type: String, required: true }
    },
    slug: {
        en: { type: String, required: true, unique: true },
        id: { type: String, required: true, unique: true }
    },

    // Fields that are not language-specific
    featuredImage: {
        url: { type: String, required: true },
        altText: { // Alt text should also be multilingual for image SEO
            en: { type: String, required: true },
            id: { type: String, required: true }
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    tags: [String],
    isFeatured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);