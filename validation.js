const Joi = require('joi');
const registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Nama pengguna harus berupa teks.',
            'string.alphanum': 'Nama pengguna hanya boleh berisi huruf dan angka.',
            'string.min': 'Nama pengguna minimal harus {#limit} karakter.',
            'string.max': 'Nama pengguna maksimal {#limit} karakter.',
            'any.required': 'Nama pengguna wajib diisi.'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.base': 'Kata sandi harus berupa teks.',
            'string.min': 'Kata sandi minimal harus {#limit} karakter.',
            'any.required': 'Kata sandi wajib diisi.'
        })
});

const loginSchema = Joi.object({
    username: Joi.string()
        .required()
        .messages({
            'any.required': 'Nama pengguna wajib diisi.'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Kata sandi wajib diisi.'
        })
});

const createRoomSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': 'Nama ruangan tidak boleh kosong.',
            'string.max': 'Nama ruangan maksimal {#limit} karakter.',
            'any.required': 'Nama ruangan wajib diisi.'
        })
});

const publishMessageSchema = Joi.object({
    params: Joi.object({
        topicId: Joi.string()
            .required()
            .messages({
                'string.base': 'ID Topik harus berupa teks.',
                'any.required': 'ID Topik diperlukan di URL.'
            })
    }),
    body: Joi.object()
        .min(1)
        .required()
        .messages({
            'object.base': 'Body pesan harus berupa objek JSON.',
            'object.min': 'Body pesan tidak boleh kosong.',
            'any.required': 'Body pesan wajib diisi.'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    createRoomSchema,
    publishMessageSchema
};