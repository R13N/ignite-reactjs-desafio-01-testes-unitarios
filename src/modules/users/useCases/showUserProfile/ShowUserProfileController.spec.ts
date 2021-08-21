import { app } from "../../../../app";
import request from "supertest";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import createConnection from "../../../../database";

let connection: Connection;

describe("Show user profile", () => {

  
  beforeAll(async()=>{
    connection = await createConnection();
  });
  
  beforeEach(async()=>{
    await connection.runMigrations();
    
    const id = uuidv4();
    const password = await hash("password123", 8);
    
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'Clifford Torres', 'tob@ir.sv', '${password}', 'now()', 'now()')`
    );
  });

  afterEach(async()=>{
    await connection.dropDatabase();
  });

  afterAll(async() => {
    await connection.close();
  });
  
  it("should be able to show user profile with authenticated user", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "tob@ir.sv",
      password: "password123",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(200);

  });

  it("should not to be able to show a nonexistent user profile.", async () => {

    const response = await request(app).post("/api/v1/sessions").set({
      email: "sit@ocmu.jp",
      password: "fakepass"
    })

    const { token } = response.body;

    const anyTokenResponse = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });

    expect(anyTokenResponse.body).toEqual({message: 'JWT invalid token!'});
    expect(anyTokenResponse.status).toBe(401);
  });

})