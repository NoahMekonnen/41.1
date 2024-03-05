const express = require("express")
const router = new express.Router();
const User = require("../models/user");
const {SECRET_KEY} = require("../config")
const jwt = require('jsonwebtoken')

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', (req, res, next) => {
    try {
        const { username, password} = req.body
        User.authenticate(username, password)
        return jwt.sign(req.body,SECRET_KEY)
    } catch (e) {
        next(e)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', (req, res, next) => {
    try {
        User.register(req.body)
        return jwt.sign(req.body,SECRET_KEY)
    } catch (e) {
        next(e)
    }
})

module.exports = router;