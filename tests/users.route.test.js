const usersData = require("../data/users.data");
const { MongoClient } = require("mongodb");
const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();
require("../db");
const app = require("../app");

describe("drinks", () => {
  let connection;
  let db;

  beforeAll(async () => {
    const dbParams = global.__MONGO_URI__.split("/");
    const dbName = dbParams[dbParams.length - 1];
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true
    });
    db = await connection.db(dbName);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await connection.close();
    await db.close();
  });

  beforeEach(async () => {
    await db.dropDatabase();
  });

  it("POST /users/register should be able to register user if username has not been used before", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);
    const newUser = {
      username: "newuser",
      password: "password"
    };
    const response = await request(app)
      .post("/users/register")
      .send(newUser)
      .set("Content-Type", "application/json");

    const registeredUser = await usersCollection.findOne({
      username: newUser.username
    });
    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual(`User ${newUser.username} created!`);
    expect(registeredUser.username).toEqual(newUser.username);
  });

  it("POST /users/register should return error if username has been registered before", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);

    const newUser = {
      username: "testuser2",
      password: "password"
    };

    const response = await request(app)
      .post("/users/register")
      .send(newUser)
      .set("Content-Type", "application/json");

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual("User already exists");
  });

  xit("POST /users/register should return error if missing username", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);
    const newUser = {
      password: "blahblah"
    };
    const response = await request(app)
      .post("/users/register")
      .send(newUser)
      .set("Content-Type", "application/json");

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual('"username" is required');
  });

  xit("POST /users/register should return error if missing password", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);
    const newUser = {
      username: "blahblah"
    };
    const response = await request(app)
      .post("/users/register")
      .send(newUser)
      .set("Content-Type", "application/json");

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual('"password" is required');
  });

  it("POST /users/register should return error if password is less than 8 characters", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);
    const newUser = {
      username: "blahblah",
      password: "passwor"
    };
    const response = await request(app)
      .post("/users/register")
      .send(newUser)
      .set("Content-Type", "application/json");

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(
      '"password" length must be at least 8 characters long'
    );
  });

  it("POST /users/login should allow login if user is registered", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);

    const oldUser = {
      username: "testuser1",
      password: "password"
    };

    const response = await request(app)
      .post("/users/login")
      .send(oldUser)
      .set("Content-Type", "application/json");
    expect(response.status).toEqual(200);
    expect(response.body.username).toEqual(oldUser.username);
  });

  it("POST /users/login should deny login if user is not registered", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);

    const oldUser = {
      username: "testuser3",
      password: "password"
    };

    const response = await request(app)
      .post("/users/login")
      .send(oldUser)
      .set("Content-Type", "application/json");
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual("User not found");
  });

  it("POST /users/login should deny login if password is incorrect", async () => {
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);

    const oldUser = {
      username: "testuser1",
      password: "wrong_password"
    };

    const response = await request(app)
      .post("/users/login")
      .send(oldUser)
      .set("Content-Type", "application/json");
    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual("Your password is incorrect");
  });
});
