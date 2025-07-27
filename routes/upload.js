const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { protectApi, isAdmin } = require('../middleware/auth'); // Protect the route

// Configure the S3 client
const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// @desc    Get a presigned URL for uploading a file
// @route   POST /api/upload/presigned-url
// @access  Private/Admin
router.post('/presigned-url', protectApi, isAdmin, async (req, res) => {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
        return res.status(400).json({ message: 'fileName and fileType are required' });
    }

    // Generate a unique file key to prevent overwrites
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const fileKey = `articles/${randomBytes}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
    });

    try {
        // Generate the presigned URL, valid for 5 minutes
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        res.json({
            uploadUrl: signedUrl,
            // The final URL of the image after upload
            finalImageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileKey}`
        });
    } catch (error) {
        console.error('Error generating presigned URL', error);
        res.status(500).json({ message: 'Could not generate upload URL' });
    }
});

module.exports = router;