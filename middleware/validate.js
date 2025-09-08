// middleware/validate.js
const Joi = require('joi');

const isJoiSchema = (s) => s && typeof s.validate === 'function';

// Normalize plain objects into Joi.object(...), pass through Joi schemas
const toJoiObject = (maybe) => {
    if (!maybe) return null;
    if (isJoiSchema(maybe)) return maybe;
    if (typeof maybe === 'object') return Joi.object(maybe);
    return null;
};

const opts = {
    allowUnknown: true,
    abortEarly: false,
    stripUnknown: false,
};

const looksLikeWrappedMultiPart = (schema) => {
    // Safely inspect Joi schema shape without using .keys.has (which caused your old error)
    try {
        const d = typeof schema?.describe === 'function' ? schema.describe() : null;
        const k = d && d.type === 'object' && d.keys ? d.keys : null;
        return !!(k && (k.params || k.query || k.body));
    } catch {
        return false;
    }
};

const validate = (input) => (req, res, next) => {
    try {
        // CASE 1: single Joi schema (may be "wrapped multipart" or "body-only")
        if (isJoiSchema(input)) {
            if (looksLikeWrappedMultiPart(input)) {
                // Schema expects an object like { params, query, body }
                const { error, value } = input.validate(
                    { params: req.params, query: req.query, body: req.body },
                    opts
                );
                if (error) return res.status(400).json({ message: error.details[0].message });

                // propagate sanitized values if provided
                if (value?.params) req.params = value.params;
                if (value?.query)  req.query  = value.query;
                if (value?.body)   req.body   = value.body;
                return next();
            } else {
                // Treat as body schema
                const { error, value } = input.validate(req.body, opts);
                if (error) return res.status(400).json({ message: error.details[0].message });
                req.body = value;
                return next();
            }
        }

        // CASE 2: object-of-schemas style: { params, query, body }
        if (input && typeof input === 'object' &&
            ('params' in input || 'query' in input || 'body' in input)) {

            const pSchema = toJoiObject(input.params);
            const qSchema = toJoiObject(input.query);
            const bSchema = toJoiObject(input.body);

            if (pSchema) {
                const { error, value } = pSchema.validate(req.params, opts);
                if (error) return res.status(400).json({ message: error.details[0].message });
                req.params = value;
            }
            if (qSchema) {
                const { error, value } = qSchema.validate(req.query, opts);
                if (error) return res.status(400).json({ message: error.details[0].message });
                req.query = value;
            }
            if (bSchema) {
                const { error, value } = bSchema.validate(req.body, opts);
                if (error) return res.status(400).json({ message: error.details[0].message });
                req.body = value;
            }
            return next();
        }

        // CASE 3: nothing provided → allow anything in body
        const { error, value } = Joi.object().validate(req.body, opts);
        if (error) return res.status(400).json({ message: error.details[0].message });
        req.body = value;
        return next();

    } catch (err) {
        return next(err);
    }
};

module.exports = validate;
