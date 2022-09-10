import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findById: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@gmail.com',
          password: '1234',
        } as User),
      findByEmail: (email: string) =>
        Promise.resolve([
          {
            id: 1,
            email,
            password: '1234',
          } as User,
        ]),
      // update: () => null,
      // remove: () => null,
    };

    fakeAuthService = {
      // signup: () => null,
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with given email', async () => {
    const users = await controller.findAllUsers('test@gmail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@gmail.com');
  });

  it('findUser returns a user with given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findById = (id: number) => Promise.resolve(null);
    await expect(controller.findUser('1')).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('signin updated session object and returns a user', async () => {
    const session = { userId: -1 };
    const user = await controller.signin(
      { email: 'test@gmail.com', password: 'test123' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
