const express = require("express")
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/',ensureLoggedIn, async (req,res,next) =>{
    try{
        return res.json({users:await User.all()})
    }catch(e){
        return next(e)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username',ensureLoggedIn,ensureCorrectUser, async (req,res,next)=>{
    try{
        return res.json({user:await User.get(req.params.username)})
    }catch(e){
        return next(e)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to',ensureLoggedIn,ensureCorrectUser, async (req,res,next)=>{
    try{
        return res.json({messages:await User.messagesTo()})
    }catch(e){
        return next(e)
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from',ensureLoggedIn,ensureCorrectUser, async (req,res,next) =>{
    try{
        return res.json({messages:await User.messagesFrom()})
    }catch(e){
        return next(e)
    }
})

module.exports = router;