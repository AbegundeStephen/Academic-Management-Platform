// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findOneByEmail: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-token'),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('mock-secret'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        jwtService = module.get(JwtService);
    });

    describe('validateUser', () => {
        it('should return user if credentials are valid', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: await bcrypt.hash('password', 10),
                role: 'student',
            } as User;

            usersService.findOneByEmail.mockResolvedValue(mockUser);

            const result = await service.validateUser('test@example.com', 'password');
            expect(result).toEqual(expect.objectContaining({
                id: '1',
                email: 'test@example.com',
            }));
        });

        it('should return null if credentials are invalid', async () => {
            usersService.findOneByEmail.mockResolvedValue(null);

            const result = await service.validateUser('test@example.com', 'password');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access and refresh tokens', async () => {
            const mockUser = { id: '1', email: 'test@example.com', role: 'student' } as User;
            const result = await service.login(mockUser);

            expect(result).toEqual({
                accessToken: 'mock-token',
                refreshToken: 'mock-token',
            });
            expect(jwtService.sign).toHaveBeenCalledTimes(2);
        });
    });
});