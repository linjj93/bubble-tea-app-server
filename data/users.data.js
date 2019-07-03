module.exports = [
  {
    _id: "5d1b4feaf48ce21a44fc21bf",
    username: "testuser1",
    password: "$2a$10$V9jAdHpMGu98iVUcXffe0OtCIs5zEKYoxaPu4yg3awEgznguLu/sO",
    drinks: [
      {
        _id: "5d1a1d3eb555a81d301ce7a4",
        name: "Yakult Green Tea",
        topping: ["White Pearl"],
        price: 4.2,
        sugarLevel: 25,
        store: "Gong Cha",
        dateBought: new Date().toISOString()
      }
    ]
  },
  {
    _id: "5d1b960c5a5c3105e83ed51e",
    username: "testuser2",
    password: "$2a$10$NrchS0idG1zU679unFfohuL4.VPjRMJse00LrKREWozH.kteRdXYW",
    drinks: [
      {
        _id: "5d1a1d3eb555a81d301ce7a5",
        name: "Oolong Milk Tea",
        toppings: ["Pearl"],
        price: 3.4,
        sugarLevel: 50,
        store: "LiHo",
        dateBought: new Date().toISOString()
      },
      {
        _id: "5d1a1d3eb555a81d301ce7a6",
        name: "Ice Cream Milk Tea",
        toppings: ["None"],
        price: 4,
        sugarLevel: 50,
        store: "Koi",
        dateBought: new Date().toISOString()
      }
    ]
  }
];
