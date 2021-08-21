import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement Operation Controller", ()=>{

  beforeAll(async()=>{
    connection = await createConnection();
  });

  beforeEach(async()=>{
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("passGetBalanceTest", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'Isabelle Greene', 'uhiron@fodem.pk', '${password}', 'now()', 'now()')`
    );
  });

  afterEach(async()=>{
    await connection.dropDatabase();
  });

  afterAll(async()=>{
    await connection.close();
  });

  it("should be able to get a statement by operation id", async()=>{
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "uhiron@fodem.pk",
        password: "passGetBalanceTest"
      });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Deposit test",
        amount: 100,
      })
      .set({Authorization: `Bearer ${token}`}
    );

    const statementId = deposit.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(200);

  });

  it("should not be able to get a statement operation from a nonexistent user", async ()=>{
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "fakemail@email.com",
        password: "anyPass"
      });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Deposit test",
        amount: 100,
      })
      .set({Authorization: `Bearer ${token}`}
    );

    const statementId = deposit.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(401);
  })
});