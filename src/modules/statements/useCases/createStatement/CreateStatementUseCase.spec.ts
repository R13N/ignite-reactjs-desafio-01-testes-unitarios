import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create statement", () => {
  beforeEach(()=>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

  })

  it("should be able to create a new deposit statement", async () => {

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    const user: ICreateUserDTO = {
      name: "User Name",
      email: "name@email.com.br",
      password: "password",
    };

    const { id } = await createUserUseCase.execute(user);

    const newDeposit: ICreateStatementDTO = {
      user_id: id as string,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "test deposit"
    }

    const depositStatement = await createStatementUseCase.execute(newDeposit);

    expect(depositStatement).toHaveProperty("id");
    expect(depositStatement.type).toEqual("deposit");

  })

  it("should be able to create a new withdraw statement", async () => {

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    const user: ICreateUserDTO = {
      name: "User Name",
      email: "name@email.com.br",
      password: "password",
    };

    const { id } = await createUserUseCase.execute(user);

    const newDeposit: ICreateStatementDTO = {
      user_id: id as string,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "test deposit"
    }

    const newWithdraw: ICreateStatementDTO = {
      user_id: id as string,
      amount: 50,
      type: OperationType.WITHDRAW,
      description: "test deposit"
    }

    await createStatementUseCase.execute(newDeposit);
    const withdrawStatement = await createStatementUseCase.execute(newWithdraw);

    expect(withdrawStatement).toHaveProperty("id");

  })

  it("should not be able to create a new withdraw when funds were insufficient.", async () => {
    expect( async ()=>{

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }
  
      const user: ICreateUserDTO = {
        name: "User Name Test",
        email: "username@email.com.br",
        password: "123456",
      };
  
      const { id } = await createUserUseCase.execute(user);
  
      const newWithdraw: ICreateStatementDTO = {
        user_id: id as string,
        amount: 50,
        type: OperationType.WITHDRAW,
        description: "test withdraw"
      }
  
      await createStatementUseCase.execute(newWithdraw);

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

  })

})