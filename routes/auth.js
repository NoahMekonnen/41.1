const express = require("express")
const router = new express.Router();
const User = require("../models/user");
const {SECRET_KEY} = require("../config")
const jwt = require('jsonwebtoken')
let specialPassword;
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password} = req.body
        await User.authenticate(username, password)
        const token = jwt.sign({ username: username }, SECRET_KEY)
        specialPassword = token
        console.log(token,"Login Token")
        const user = await User.get(username)
        await User.updateLoginTimestamp(user)
        return res.json({token})
    } catch (e) {
        return next(e)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        
        await User.register(req.body)
        await User.authenticate(req.body.username, req.body.password)
        const token = jwt.sign({"username": req.body.username},SECRET_KEY)
        console.log(token,"Login Token")
        specialPassword = token
        return res.json({token})
    } catch (e) {
        return next(e)
    }
})

module.exports = {router, specialPassword};