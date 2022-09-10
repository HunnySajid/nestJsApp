import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  const users: User[] = [];
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
      findByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });
  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const password = '123456';
    const user = await service.signup('test1@test.com', password);

    expect(user.password).not.toEqual(password);
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signsup with already used email', async () => {
    await service.signup('unique@test.com', 'anypassword');

    const promise = service.signup('unique@test.com', 'anypassword');
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('throws error if signin is called with ununsed user', async () => {
    const promise = service.signin('abc@test.com', 'asdasd');
    await expect(promise).rejects.toThrowError(NotFoundException);
  });

  it('throws error if user is signing in with invalid password', async () => {
    await service.signup('random@test.com', 'correctpassword');
    const promise = service.signin('random@test.com', 'wrongpassword');
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('abc@test.com', 'specificpassword');
    const user = await service.signin('abc@test.com', 'specificpassword');
    expect(user).toBeDefined();
  });
});
