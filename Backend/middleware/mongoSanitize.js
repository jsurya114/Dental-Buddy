
const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            // Remove keys starting with $ or containing .
            // (Standard mongo sanitization often removes $ keys)
            if (/^\$/.test(key) || key.includes('.')) {
                delete obj[key];
            } else {
                // Recurse
                sanitize(obj[key]);
            }
        }
    }
};

const mongoSanitize = () => {
    return (req, res, next) => {
        try {
            if (req.body) sanitize(req.body);
            if (req.params) sanitize(req.params);
            if (req.query) sanitize(req.query); // Mutates in place, avoiding assignment error
            next();
        } catch (err) {
            next(err);
        }
    };
};

export default mongoSanitize;
