import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create user controller", ()=> {
  
  beforeAll(async()=>{
    connection = await createConnection();
    await connection.runMigrations();
  });
  
  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("Should be able to create a new user.", async ()=> {

    const response = await request(app).post("/api/v1/users").send({
      name: "Mario Graves",
      email: "guotvof@le.to",
      password: "123456"
    })

    expect(response.status).toBe(201);
  })
  it("Should not be able to create a user with e-mail already in use.", async () =>{
    const response = await request(app).post("/api/v1/users").send({
      name: "Mario Graves",
      email: "guotvof@le.to",
      password: "123456"
    })

    expect(response.status).toBe(400);
  })

})