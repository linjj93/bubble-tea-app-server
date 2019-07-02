const mockData = require("../data/drinks.data");
const { MongoClient } = require("mongodb");
const request = require("supertest");
const mongoose = require("mongoose");
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

  it("GET / should return Hello World", async () => {
    const response = await request(app).get("/");
    expect(response.body).toEqual("Hello World!");
  });

  const mockDrink = {
    id: 6,
    name: "Ovaltine",
    topping: ["None"],
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
    it("GET /drinks should return all drinks", async () => {
      const collection = db.collection("drinks");
      await collection.insertMany(mockData);

      const response = await request(app).get("/drinks");
      expect(response.body).toMatchObject(mockData);
    });

    it("POST /drinks should add drink and return drink added", async () => {
      const collection = db.collection("drinks");
      const response = await request(app)
        .post("/drinks")
        .send(mockDrink)
        .set("Content-Type", "application/json");
      expect(response.body).toMatchObject(mockDrink);
      const foundDrink = await collection.findOne({ id: 6 });
      expect(foundDrink.price).toEqual(3.0);
      expect(foundDrink.store).toEqual("Woobbee");
    });

    it.only("POST /drinks should return 400 if it is missing a field", async () => {
      const collection = db.collection("drinks");
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
});
