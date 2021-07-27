import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository, 
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository, 
      inMemoryUsersRepository
    );
  })

  it("should be able to get a balance", async () => {

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    const user: ICreateUserDTO = {
      name: "Name Test",
      email: "nametest@email.com.br",
      password: "password",
    }

    const { id } = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      user_id: id as string,
      amount: 200,
      description: "deposit test",
      type: OperationType.DEPOSIT
    }

    const withdraw: ICreateStatementDTO = {
      user_id: id as string,
      amount: 100,
      description: "withdraw test",
      type: OperationType.WITHDRAW
    }

    await createStatementUseCase.execute(deposit);
    await createStatementUseCase.execute(withdraw);

    const balance = await getBalanceUseCase.execute({user_id: id as string});

    expect(balance).toHaveProperty("balance");

  })
})