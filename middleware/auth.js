/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { specialPassword }= require("../routes/auth")
const User = require("../models/user")

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = specialPassword;
    console.log(SECRET_KEY,tokenFromBody,"authenti group")
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    console.log(req.user,"authenticate")
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  console.log(req.user,"ensurelogged!!")
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    console.log(req.user,"USER!!")
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

async function ensureCorrectDMUsers(req, res, next){
  try{
    const info = jwt.decode(specialPassword)
    console.log(specialPassword)
    if (info.username == req.body.message.from_user.username ){
      next()
    } else if ( info.username == req.body.message.to_user.username){
      next()
    }
    else{
      return next({ status: 401, message: "Unauthorized" });
    }
    }
   catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

function ensureRecipient(req, res, next){
  try{
    if (req.user.to_username == req.params.username){
      return next()
    }else{
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectDMUsers,
  ensureRecipient
};
