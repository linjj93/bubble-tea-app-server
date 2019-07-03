const usersData = require("../data/users.data");
const { MongoClient } = require("mongodb");
const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();
require("../db");
const app = require("../app");

describe("app", () => {
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
    const usersCollection = db.collection("users");
    await usersCollection.insertMany(usersData);
  });

  describe("authentication", () => {
    it("POST /users/register should be able to register user if username has not been used before", async () => {
      const newUser = {
        username: "newuser",
        password: "password"
      };
      const response = await request(app)
        .post("/users/register")
        .send(newUser)
        .set("Content-Type", "application/json");

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual(
        `User ${newUser.username} created!`
      );
    });

    it("POST /users/register should return error if username has been registered before", async () => {
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

    it("POST /users/register should return error if missing username", async () => {
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

    it("POST /users/register should return error if missing password", async () => {
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

  describe("user interaction", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZDFjNTVmY2I1MTVhYTIzM2M2ZmMwNjYiLCJpYXQiOjE1NjIxMzgxMjI3NTgsInVzZXIiOiJ0ZXN0dXNlcjIiLCJleHAiOjE1NjIxMzgxMzM1NTh9.IGAfl673YpcZqnmgeofLP456u-pNhSAfTXEWLblcCVI";

    it("GET /users/testuser2 should show welcome message", async () => {
      const response = await request(app)
        .get("/users/testuser2")
        .set("Authorization", "Bearer " + token);
      expect(response.body.message).toEqual("Welcome, testuser2!");
    });

    it("GET /users/testuser2/drinks should show testuser2 drinks", async () => {
      const response = await request(app)
        .get("/users/testuser2/drinks")
        .set("Authorization", "Bearer " + token);

      expect(response.body).toEqual(usersData[1].drinks);
    });

    it("POST /users/testuser2/drinks should add a drink and addition should persist", async () => {
      const mockDrink = {
        _id: "5d1a1d3eb555a81d301ce7a7",
        name: "Ovaltine",
        toppings: ["None"],
        price: 3.0,
        sugarLevel: 0,
        store: "Woobbee",
        dateBought: new Date().toISOString()
      };

      const response = await request(app)
        .post("/users/testuser2/drinks")
        .send(mockDrink)
        .set("Content-Type", "application/json")
        .set("Authorization", "Bearer " + token);

      expect(response.status).toEqual(201);
      expect(response.body).toMatchObject(mockDrink);

      const userDrinksAfterAddition = await request(app)
        .get("/users/testuser2/drinks")
        .set("Authorization", "Bearer " + token);
      expect(userDrinksAfterAddition.body).toHaveLength(3);
    });

    it("DELETE /users/testuser2/drinks/:id should allow testuser2 to delete a drink and removal should persist", async () => {
      const userDrinks = await request(app)
        .get("/users/testuser2/drinks")
        .set("Authorization", "Bearer " + token);

      expect(userDrinks.body).toHaveLength(2);
      const drinkToDelete = userDrinks.body[0];

      const response = await request(app)
        .delete(`/users/testuser2/drinks/${drinkToDelete._id}`)
        .set("Authorization", "Bearer " + token);

      expect(response.body).toMatchObject(drinkToDelete);
      const userDrinksAfterDeletion = await request(app)
        .get("/users/testuser2/drinks")
        .set("Authorization", "Bearer " + token);
      expect(userDrinksAfterDeletion.body).toHaveLength(1);
    });

    it("DELETE /users/testuser2/drinks/id should return error if id does not exist", async () => {
      const response = await request(app)
        .delete("/users/testuser2/drinks/some-rubbish-id")
        .set("Authorization", "Bearer " + token);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("No such drink exists.");
    });

    it("PUT /users/testuser2/drinks/id should update drink", async () => {
      const userDrinks = await request(app)
        .get("/users/testuser2/drinks")
        .set("Authorization", "Bearer " + token);

      const drinkToUpdate = userDrinks.body[1];

      const fieldsToUpdate = {
        price: 5.0
      };
      const update = await request(app)
        .put(`/users/testuser2/drinks/${drinkToUpdate._id}`)
        .send(fieldsToUpdate)
        .set("Content-Type", "application/json")
        .set("Authorization", "Bearer " + token);

      expect(update.body.price).toEqual(fieldsToUpdate.price);
      expect(update.status).toEqual(200);
    });

    it("PUT /users/testuser2/drinks/id should return error if id does not exist", async () => {
      const fieldsToUpdate = {
        price: 5.0
      };
      const response = await request(app)
        .put(`/users/testuser2/drinks/non-existent-id`)
        .send(fieldsToUpdate)
        .set("Content-Type", "application/json")
        .set("Authorization", "Bearer " + token);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("No such drink exists.");
    });
  });
});
