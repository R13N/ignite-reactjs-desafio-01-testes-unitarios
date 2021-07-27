import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it("should be able to show user profile with authenticated user", async () => {
    const user: ICreateUserDTO = {
      name: "user",
      email: "testeauth@email.com.br",
      password: "password",
    };

    const loginUser = await createUserUseCase.execute(user);

    const authUser = await showUserProfileUseCase.execute(loginUser.id as string);

    expect(authUser.id).toEqual(loginUser.id);
  })

  it("should not be able to show an user profile with an unauthenticated user", () => {
    expect(async() => {
      const unAuthID = "unauthID";

      await showUserProfileUseCase.execute(unAuthID);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})