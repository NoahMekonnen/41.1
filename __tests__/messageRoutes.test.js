const request = require("supertest");
const db = require("../db");
const app = require("../app");
const User = require("../models/user");
const Message = require("../models/message");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


describe("Test Message class", function () {

    let testUserToken1;
    let testUserToken2;
    let testUserToken3;

    beforeEach(async function () {
      await db.query("DELETE FROM messages");
      await db.query("DELETE FROM users");
      await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");
  
      let u1 = await User.register({
        username: "test1",
        password: "password",
        first_name: "Test1",
        last_name: "Testy1",
        phone: "+14155550000",
      });
      let u2 = await User.register({
        username: "test2",
        password: "password",
        first_name: "Test2",
        last_name: "Testy2",
        phone: "+14155552222",
      });
      let u3 = await User.register({
        username: "test3",
        password: "password",
        first_name: "Test3",
        last_name: "Testy3",
        phone: "+14155553333",
      });
      let m1 = await Message.create({
        from_username: "test1",
        to_username: "test2",
        body: "u1-to-u2"
      });
      let m2 = await Message.create({
        from_username: "test2",
        to_username: "test1",
        body: "u2-to-u1"
      });

      testUserToken1 = jwt.sign({username:"test1"},SECRET_KEY)
      testUserToken2 = jwt.sign({username:"test2"},SECRET_KEY)
      testUserToken3 = jwt.sign({username:"test3"},SECRET_KEY)
    });


    test("GET /:id only sender or recipient can view message", async function(){

        let res1 = await request(app)
        .get("/messages/1")
        .send({_token: testUserToken3})
        expect(res1.statusCode).toEqual(401)

        let res2 = await request(app)
        .get("/messages/1")
        .send({_token: testUserToken1})
        expect(res2.statusCode).toEqual(200)

        let res3 = await request(app)
        .get("/messages/1")
        .send({_token: testUserToken2})
        expect(res2.statusCode).toEqual(200)
    })
  
    test("POST /:id/read only the recipient of the message can mark it as read", async function(){

        let res1 = await request(app)
        .post("/messages/1/read")
        .send({_token:testUserToken2})
        expect(res1.statusCode).toEqual(200)

        let res2 = await request(app)
        .post("/messages/1/read")
        .send({_token:testUserToken1})
        expect(res2.statusCode).toEqual(401)
    })

    test("POST /messages one user can send a message to any other user", async function(){
        let res1 = await request(app)
        .post("/messages")
        .send({
            _token:testUserToken1,
            to_username:"test2",
            body:"new"
        })
        expect(res1.statusCode).toEqual(200)
        let res2 = await request(app)
        .post("/messages")
        .send({
            _token:testUserToken2,
            to_username:"test3",
            body:"new"
        })
        expect(res2.statusCode).toEqual(200)
        let res3 = await request(app)
        .post("/messages")
        .send({
            _token:testUserToken3,
            to_username:"test1",
            body:"new"
        })
        expect(res3.statusCode).toEqual(200)
    })

})