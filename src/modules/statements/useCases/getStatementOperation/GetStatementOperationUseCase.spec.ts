import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

interface IStatementOp {
  user_id: string;
  statement_id: string;
}


describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository, 
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository, 
      inMemoryStatementsRepository
    );
  });

  it("should be able to get a statement operation by operation id", async () => {

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    const user: ICreateUserDTO = {
      name: "User Name Test",
      email: "username@email.com.br",
      password: "secret",
    }

    const { id: user_id } = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      user_id: user_id as string,
      amount: 100,
      description: "another deposit test",
      type: OperationType.DEPOSIT,
    }

    const { id: statement_id } = await createStatementUseCase.execute(deposit);

    const statementOp: IStatementOp = {
      user_id: user_id as string,
      statement_id: statement_id as string,
    }

    const statementOpReturn = await getStatementOperationUseCase.execute(statementOp);
    expect(statementOpReturn).toHaveProperty("id");
  });

  it("should not be able to get a statement operation with an invalid user id", async () => {

    await expect(async() => {
      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }
  
      const user: ICreateUserDTO = {
        name: "User Name Test",
        email: "username@email.com.br",
        password: "secret",
      }
  
      const { id: user_id } = await createUserUseCase.execute(user);
  
      const deposit: ICreateStatementDTO = {
        user_id: user_id as string,
        amount: 100,
        description: "another deposit test",
        type: OperationType.DEPOSIT,
      }
  
      const { id: statement_id } = await createStatementUseCase.execute(deposit);
  
      const statementOp: IStatementOp = {
        user_id: "any id",
        statement_id: statement_id as string,
      }
  
      await getStatementOperationUseCase.execute(statementOp);

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    
  });

  it("should not be able to get a statement operation with an invalid statement id", async () => {

    await expect(async() => {
      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }
  
      const user: ICreateUserDTO = {
        name: "User Name",
        email: "name@email.com.br",
        password: "secret key",
      }
  
      const { id: user_id } = await createUserUseCase.execute(user);
  
      const deposit: ICreateStatementDTO = {
        user_id: user_id as string,
        amount: 100,
        description: "another deposit test",
        type: OperationType.DEPOSIT,
      }
  
      await createStatementUseCase.execute(deposit);
  
      const statementOp: IStatementOp = {
        user_id: user_id as string,
        statement_id: "any id",
      }
  
      await getStatementOperationUseCase.execute(statementOp);

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    
  });
})