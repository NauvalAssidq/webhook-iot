const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_USERNAME = 'adminwebhookiot@webhook.com';
const ADMIN_PASSWORD = 'adminwebhookiot123';

const mongoURI = `mongodb://mongoadmin:webhook-service@localhost:27017/webhook_db?authSource=admin`;

async function seedAdmin() {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Koneksi MongoDB berhasil untuk seeding');

        const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
        if (existingAdmin) {
            console.log('✅ Pengguna admin sudah ada.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const adminUser = new User({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        console.log('Pengguna admin berhasil dibuat!');

    } catch (error) {
        console.error('Gagal membuat pengguna admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Koneksi MongoDB ditutup.');
    }
}

seedAdmin();