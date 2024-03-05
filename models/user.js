/** User class for message.ly */

const { DB_URI } = require("../config");
const db= require('../db')
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const result = await db.query(`
                    INSERT INTO users 
                    (username, password, first_name, last_name, phone, join_at,last_login_at)
                    VALUES ($1,$2,$3,$4,$5,current_timestamp,current_timestamp)
                    RETURNING username, password, first_name, last_name, phone `,
      [username, password, first_name, last_name, phone])
    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`
    SELECT * FROM users
    WHERE username=$1
    `,[username])
    if (result){
    const databasePassword = result.rows[0].password
      return password == databasePassword
    }else{
      return false
    }
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(`
    UPDATE users
    SET last_login_at = current_timestamp
    WHERE username=$1
    RETURNING username, password, first_name, last_name, phone, join_at, last_login_at
    `,[username])  
    if (!result) throw ExpressError("User not found",404)
    return result.rows[0]
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(`
    SELECT username,first_name,last_name,phone FROM users
    `)
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(`
    SELECT username,first_name,last_name,phone,last_login_at,join_at FROM users 
    WHERE username=$1
    `,[username])
    if (!result) throw ExpressError("User not found",404)
    return result.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(`
    SELECT id,body, sent_at, read_at
    FROM messages
    WHERE from_username=$1
    `,[username])
    const result3 = await db.query(`
    SELECT to_username
    FROM messages
    WHERE from_username=$1
    `,[username])
    const result2 = await db.query(`
    SELECT first_name,last_name,phone,username
    FROM users
    WHERE username=$1
    `,[result3.rows[0].to_username])
    result.rows[0].to_user = result2.rows[0]
    return result.rows
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(`
    SELECT id,body, sent_at, read_at
    FROM messages
    WHERE to_username=$1
    `,[username])
    const result3 = await db.query(`
    SELECT to_username
    FROM messages
    WHERE from_username=$1
    `,[username])
    const result2 = await db.query(`
    SELECT first_name,last_name,phone,username
    FROM users
    WHERE username=$1
    `,[result3.rows[0].to_username])
    result.rows[0].from_user = result2.rows[0]
    return result.rows
   }
}


module.exports = User;