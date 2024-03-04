/** User class for message.ly */

const { DB_URI } = require("../config");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const result = await db.query(`
                    INSERT INTO users 
                    (username, password, first_name, last_name, phone)
                    VALUES ($1,$2,$3,$4,$5)
                    RETURNING username, password, first_name, last_name, phone `,
      [username, password, first_name, last_name, phone])
    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`
    SELECT * FROM users
    WHERE username=$1
    RETURNING password
    `,[username])
    if (result){
    const databasePassword = result.rows[0]
    return password == jwt.decode(databasePassword).password
    }else{
      return false
    }
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = db.query(`
    UPDATE users
    SET last_login_at = current_timestamp
    WHERE username=$1
    RETURNING username, password, first_name, last_name, phone
    `,[username])
    return result.rows[0]
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = db.query(`
    SELECT username,first_name,last_name,phone FROM users
    `)
    return result.rows[0]
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
    const result = db.query(`
    SELECT * FROM users 
    WHERE username=$1
    `,[username])
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
    const result = db.query(`
    SELECT * FROM messages
    WHERE from_username=$1
    `,[username])
    return result.rows[0]
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = db.query(`
    SELECT * FROM messages
    WHERE to_username=$1
    `,[username])
    return result.rows[0]
   }
}


module.exports = User;