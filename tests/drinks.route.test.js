const mockUserData = require("../data/users.data");
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

  const mockDrink = {
    name: "Ovaltine",
    toppings: ["None"],
    price: 3.0,
    sugarLevel: 0,
    store: "Woobbee",
    dateBought: new Date().toISOString()
  };

  const DrinkWithoutPrice = {
    id: 6,
    name: "Ovaltine",
    topping: ["None"],
    sugarLevel: 0,
    store: "Woobbee",
    dateBought: new Date().toISOString()
  };

  const DrinkWithoutDate = {
    id: 6,
    name: "Ovaltine",
    topping: ["None"],
    price: 5,
    sugarLevel: 0,
    store: "Woobbee"
  };

  describe("/drinks", () => {
    it.only("GET /drinks should return all drinks", async () => {
      const usersCollection = db.collection("users");
      await usersCollection.insertMany(mockUserData);

      const login = await request(app)
        .post("/users/login")
        .send({
          username: "testuser2",
          password: "abcdefgh"
        })
        .set("Content-Type", "application/json");

      expect(login.body.username).toEqual("testuser2");

      const response = await request(app)
        .get("/drinks")
        .set("Authorization", "Bearer " + login.body.token);

      console.log(response.body);
      expect(response.body).toHaveLength(2);
    });

    it("POST /drinks should add drink and return drink added", async () => {
      const collection = db.collection("drinks");
      const response = await request(app)
        .post("/drinks")
        .send(mockDrink)
        .set("Content-Type", "application/json");
      expect(response.status).toEqual(201);
      expect(response.body).toMatchObject(mockDrink);
      const foundDrink = await collection.findOne({ id: 6 });
      expect(foundDrink.price).toEqual(3.0);
      expect(foundDrink.store).toEqual("Woobbee");
    });

    it("POST /drinks should return 400 if it is missing a field", async () => {
      const response = await request(app)
        .post("/drinks")
        .send(DrinkWithoutPrice)
        .set("Content-Type", "application/json");
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ message: '"price" is required' });

      const response2 = await request(app)
        .post("/drinks")
        .send(DrinkWithoutDate)
        .set("Content-Type", "application/json");
      expect(response2.status).toEqual(400);
      expect(response2.body).toEqual({ message: '"dateBought" is required' });
    });
  });

  describe("/drinks/:id", () => {
    it("PUT /drinks/1 should edit the details of the first drink", async () => {
      const fieldsToUpdate = {
        topping: ["White Pearl", "Pudding"],
        price: 3.8,
        sugarLevel: 70
      };
      const collection = db.collection("drinks");
      await collection.insertMany(mockDrinkData);

      const response = await request(app)
        .put("/drinks/1")
        .send(fieldsToUpdate)
        .set("Content-Type", "application/json");

      const updatedDrink = await collection.findOne({ id: 1 });
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(updatedDrink);
      expect(updatedDrink.price).toEqual(3.8);
      expect(updatedDrink.sugarLevel).toEqual(70);
    });

    it("PUT /drinks/10 should return 404 because there is no drink with id 10", async () => {
      const fieldsToUpdate = {
        topping: ["White Pearl", "Pudding"],
        price: 3.8,
        sugarLevel: 70
      };
      const collection = db.collection("drinks");
      await collection.insertMany(mockDrinkData);

      const response = await request(app)
        .put("/drinks/10")
        .send(fieldsToUpdate)
        .set("Content-Type", "application/json");

      expect(response.status).toEqual(400);
      expect(response.body).toEqual("Drink with id 10 does not exist");
    });
  });
});
