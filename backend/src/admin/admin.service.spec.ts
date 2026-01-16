import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { User } from '../user/schemas/user.schema';
import { UserRole } from '../user/enums/user-role.enum';
import { SessionService } from '../auth/services/session.service';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/enums/error-code.enum';

describe('AdminService', () => {
  let service: AdminService;

  const mockUserId = new Types.ObjectId().toString();
  const mockActorId = new Types.ObjectId().toString();

  const mockUser = {
    _id: new Types.ObjectId(mockUserId),
    email: 'user@example.com',
    name: 'Test User',
    role: UserRole.USER,
    isVerified: true,
    isDeleted: false,
    googleId: null,
    facebookId: null,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockSessionService = {
    invalidateAllSessions: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUsers', () => {
    const mockUsers = [
      { ...mockUser, _id: new Types.ObjectId() },
      { ...mockUser, _id: new Types.ObjectId(), email: 'user2@example.com' },
    ];

    beforeEach(() => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers),
      });
      mockUserModel.countDocuments.mockResolvedValue(2);
    });

    it('should return paginated user list', async () => {
      const result = await service.listUsers(
        { page: 1, limit: 10 },
        UserRole.ADMIN,
      );

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(2);
      expect(result.data?.pagination.total).toBe(2);
      expect(result.data?.pagination.page).toBe(1);
    });

    it('should filter by role when provided', async () => {
      await service.listUsers(
        { page: 1, limit: 10, role: UserRole.USER },
        UserRole.ADMIN,
      );

      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should apply search filter', async () => {
      await service.listUsers(
        { page: 1, limit: 10, search: 'john' },
        UserRole.ADMIN,
      );

      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    beforeEach(() => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
    });

    it('should return user by ID', async () => {
      const result = await service.getUserById(mockUserId, UserRole.ADMIN);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
    });

    it('should throw error if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getUserById(mockUserId, UserRole.ADMIN),
      ).rejects.toThrow(AppException);
    });

    it('should throw error if actor cannot view user with higher role', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockUser, role: UserRole.ADMIN }),
      });

      await expect(
        service.getUserById(mockUserId, UserRole.MANAGER),
      ).rejects.toThrow(AppException);
    });
  });

  describe('updateUserStatus', () => {
    beforeEach(() => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser }),
      });
    });

    it('should deactivate user', async () => {
      const userToUpdate = {
        ...mockUser,
        isDeleted: false,
        deletedAt: undefined,
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userToUpdate),
      });

      const result = await service.updateUserStatus(
        mockUserId,
        { isActive: false },
        mockActorId,
        UserRole.ADMIN,
      );

      expect(result.success).toBe(true);
      expect(userToUpdate.save).toHaveBeenCalled();
      expect(mockSessionService.invalidateAllSessions).toHaveBeenCalled();
    });

    it('should throw error when modifying self', async () => {
      await expect(
        service.updateUserStatus(
          mockUserId,
          { isActive: false },
          mockUserId,
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(
        new AppException(
          ErrorCode.CANNOT_MODIFY_SELF,
          'Cannot modify your own account',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error when modifying user with higher role', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockUser, role: UserRole.ADMIN }),
      });

      await expect(
        service.updateUserStatus(
          mockUserId,
          { isActive: false },
          mockActorId,
          UserRole.MANAGER,
        ),
      ).rejects.toThrow(AppException);
    });
  });

  describe('updateUserRole', () => {
    beforeEach(() => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          save: jest.fn().mockResolvedValue(true),
        }),
      });
    });

    it('should update user role', async () => {
      const userToUpdate = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userToUpdate),
      });

      const result = await service.updateUserRole(
        mockUserId,
        { role: UserRole.SUPPORT },
        mockActorId,
        UserRole.ADMIN,
      );

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.SUPPORT);
      expect(mockSessionService.invalidateAllSessions).toHaveBeenCalled();
    });

    it('should throw error when assigning ADMIN role', async () => {
      await expect(
        service.updateUserRole(
          mockUserId,
          { role: UserRole.ADMIN },
          mockActorId,
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(AppException);
    });

    it('should throw error when modifying self', async () => {
      await expect(
        service.updateUserRole(
          mockUserId,
          { role: UserRole.SUPPORT },
          mockUserId,
          UserRole.ADMIN,
        ),
      ).rejects.toThrow(AppException);
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          save: jest.fn().mockResolvedValue(true),
        }),
      });
    });

    it('should soft delete user', async () => {
      const userToDelete = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userToDelete),
      });

      await service.deleteUser(mockUserId, mockActorId, UserRole.ADMIN);

      expect(userToDelete.save).toHaveBeenCalled();
      expect(mockSessionService.invalidateAllSessions).toHaveBeenCalled();
    });

    it('should throw error when deleting self', async () => {
      await expect(
        service.deleteUser(mockUserId, mockUserId, UserRole.ADMIN),
      ).rejects.toThrow(AppException);
    });

    it('should throw error when user already deleted', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, isDeleted: true }),
      });

      await expect(
        service.deleteUser(mockUserId, mockActorId, UserRole.ADMIN),
      ).rejects.toThrow(AppException);
    });
  });
});
