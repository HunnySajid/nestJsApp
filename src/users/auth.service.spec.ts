import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const newUser = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(newUser);
        return Promise.resolve(newUser);
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
    const user = await service.signup('hunain@test.com', '123456');
    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user tries to signup with already used email', (done) => {
    service.signup('alreadyused@test.com', 'randompassword').then(() => {
      service.signup('alreadyused@test.com', '123456').catch(() => {
        done();
      });
    });
  });

  it('throws when signedin is called with an unused email', (done) => {
    service.signin('unusedemail@test.com', '123456').catch(() => done());
  });

  it('throws when an invalid password is provided', (done) => {
    service.signup('random@test.com', 'correctpassword').then(() => {
      service.signin('random@test.com', 'incorrectpassword').catch(() => {
        done();
      });
    });
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('exist@test.com', '123456');
    const user = await service.signin('exist@test.com', '123456');
    expect(user).toBeDefined();
  });
});
