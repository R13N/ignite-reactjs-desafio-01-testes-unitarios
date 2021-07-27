import 'dotenv/config';
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach( async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    const loginUser: ICreateUserDTO = {
      name: "user",
      email: "testeauth@email.com.br",
      password: "password",
    };

    await createUserUseCase.execute(loginUser);
  })

  it("should be able to authenticate an user", async() => {

    const result = await authenticateUserUseCase.execute({
      email: "testeauth@email.com.br",
      password: "password",
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate user with email incorrect", () => {
    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "nonexistentuser@email.com.br",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("should not be able to authenticate user with password incorrect", () => {
    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "testeauth@email.com.br",
        password: "incorrect password",
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

})