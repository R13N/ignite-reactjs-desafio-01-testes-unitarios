import request from "supertest";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {

  beforeAll(async()=>{
    connection = await createConnection();
  });

  beforeEach(async()=>{
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("passBalanceTest", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'Max Lewis', 'caucsi@fewnauk.dz', '${password}', 'now()', 'now()')`
    );
    
  });

  afterEach(async()=>{
    await connection.dropDatabase();
  });

  afterAll(async() => {
    await connection.close();
  });

  it("should be able to make a deposit", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "caucsi@fewnauk.dz",
        password: "passBalanceTest",
      });

    const { token } = responseToken.body;
      
    const response = await request(app).post("/api/v1/statements/deposit")
    .send({
      description: "Deposit test",
      amount: 100,
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("deposit");
  });

  it("should not be able to make a deposit to a nonexistent user.", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "any@email",
        password: "fakePassTest",
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Deposit test",
        amount: 100,
      }).set({Authorization: `Bearer ${token}`}
    );

    expect(response.status).toBe(401);

  });

  it("should be able to make a withdraw", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "caucsi@fewnauk.dz",
        password: "passBalanceTest",
      });

    const { token } = responseToken.body;

    await request(app).post("/api/v1/statements/deposit")
      .send({
        description: "Deposit test",
        amount: 250,
      })
      .set({
        Authorization: `Bearer ${token}`
      });
      
    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        description: "Withdraw test",
        amount: 100,
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("withdraw");
  });

  it("should not be able to make a deposit to a nonexistent user.", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "any@email",
        password: "fakePassTest",
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Deposit test",
        amount: 100,
      }).set({Authorization: `Bearer ${token}`}
    );

    expect(response.status).toBe(401);

  });

})