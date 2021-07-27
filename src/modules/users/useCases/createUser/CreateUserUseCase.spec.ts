import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should ne able to create a new user.", async () => {
    const user = await createUserUseCase.execute({
      email: "email@test.com.br",
      name: "Name Test",
      password: "test1",
    });
    expect(user).toHaveProperty("id");
  })

  it("should not be able to create a user with an email already used.", async () => {
    expect(async () => {

      const user: ICreateUserDTO = {
        name: "name",
        email: "name@email.com.br",
        password: "password",
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);

    }).rejects.toBeInstanceOf(CreateUserError);

  })

})