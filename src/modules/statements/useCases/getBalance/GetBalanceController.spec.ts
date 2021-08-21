import { app } from "../../../../app";
import request from "supertest";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance Controller", () => {

  beforeAll(async()=>{
    connection = await createConnection();
  });

  beforeEach(async()=>{
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("passwordbalancetest", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'Alberta Jefferson', 'javec@gonon.gr', '${password}', 'now()', 'now()')`
    );
    
  });

  afterEach(async()=>{
    await connection.dropDatabase();
  });

  afterAll(async() => {
    await connection.close();
  });

  it("should be able to get balance of an authenticated user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "javec@gonon.gr",
        password: "passwordbalancetest",
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({Authorization: `Bearer ${token}`}
      );

      console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
  });

  it("should not be able to get balance from a nonexistent user.", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "any@email",
        password: "fakePassTest",
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({Authorization: `Bearer ${token}`}
    );

    expect(response.status).toBe(401);
  });

})