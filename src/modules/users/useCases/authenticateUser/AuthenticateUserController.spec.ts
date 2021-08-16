import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate an user", () => {
  
  beforeAll(async()=>{
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("password123", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'Adrian Hall', 'el@boh.nz', '${password}', 'now()', 'now()')`
    );
  });
  
  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate an user.", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "el@boh.nz",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not to be able to authenticate an user that no exists.", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "false@email.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
  });

  it("should not to be able to authenticate an user with a wrong password.", async()=>{
    const response = await request(app).post("/api/v1/sessions").send({
      email: "el@boh.nz",
      password: "wrongpass",
    });

    console.log(response.body);
    console.log(response.status);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  })

})