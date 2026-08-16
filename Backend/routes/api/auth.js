const express = require('express');
const router = express.Router();
const { promisify } = require('util');
const userSchema = require('../../models/userSchema');
const { signToken, verifyToken } = require('../../middleware/apiAuth');

const authenticate = promisify(userSchema.authenticate());

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/** POST /api/auth/register - same as signup, returns { user, token } */
router.post('/register', asyncWrap(async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }
    const newUser = new userSchema({ email, username });
    const registeredUser = await userSchema.register(newUser, password);
    const user = registeredUser.toObject ? registeredUser.toObject() : registeredUser;
    delete user.hash;
    delete user.salt;
    const token = signToken(registeredUser);
    res.status(201).json({ success: true, data: { user: { _id: user._id, username: user.username, email: user.email }, token } });
}));

/** POST /api/auth/login - returns { user, token } */
router.post('/login', asyncWrap(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    let user;
    try {
        user = await authenticate(username, password);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    const u = user.toObject ? user.toObject() : user;
    delete u.hash;
    delete u.salt;
    const token = signToken(user);
    res.json({ success: true, data: { user: { _id: u._id, username: u.username, email: u.email }, token } });
}));

/** GET /api/auth/me - verify token, return current user */
router.get('/me', verifyToken, (req, res) => {
    const u = req.user.toObject ? req.user.toObject() : req.user;
    delete u.hash;
    delete u.salt;
    res.json({ success: true, data: { user: { _id: u._id, username: u.username, email: u.email } } });
});

module.exports = router;
