import request from "supertest";
import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

// import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Show user profile", () => {

  beforeAll(async()=>{
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("password123", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'Clifford Torres', 'tob@ir.sv', '${password}', 'now()', 'now()')`
    );
    
  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  });
  
  it("should be able to authenticate an user.", async () => {

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

})