import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListRolesQueryDto } from './dto/list-roles-query.dto';
import { RoleResponseDto, RoleListData } from './dto/role-response.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new role with validation
   */
  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    // Check if slug already exists
    const existing = await this.roleModel.findOne({ slug });
    if (existing) {
      throw new ConflictException(
        `Role with name "${dto.name}" already exists`,
      );
    }

    // Validate permissions format
    this.validatePermissions(dto.permissions);

    // Create role
    const role = new this.roleModel({
      name: dto.name,
      slug,
      description: dto.description,
      isSystemRole: false,
      isProtected: false,
      permissions: dto.permissions,
    });

    await role.save();

    return this.mapToResponseDto(role);
  }

  /**
   * List all roles with pagination and search
   */
  async findAll(query: ListRolesQueryDto): Promise<RoleListData> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: FilterQuery<RoleDocument> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute queries in parallel
    const [roles, total] = await Promise.all([
      this.roleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.roleModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      roles: roles.map((role) => this.mapToResponseDto(role)),
      total,
      page,
      pages,
    };
  }

  /**
   * Get a single role by ID or slug
   */
  async findOne(idOrSlug: string): Promise<RoleResponseDto> {
    const role = await this.findRoleByIdOrSlug(idOrSlug);
    return this.mapToResponseDto(role);
  }

  /**
   * Update an existing role
   */
  async update(idOrSlug: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.findRoleByIdOrSlug(idOrSlug);

    // Prevent updating protected roles
    if (role.isProtected) {
      throw new ForbiddenException(
        'Cannot modify protected role. The USER role is immutable.',
      );
    }

    // If name is being changed, regenerate slug and check uniqueness
    if (dto.name && dto.name !== role.name) {
      const newSlug = this.generateSlug(dto.name);
      const existing = await this.roleModel.findOne({ slug: newSlug });
      if (existing && existing._id.toString() !== role._id.toString()) {
        throw new ConflictException(
          `Role with name "${dto.name}" already exists`,
        );
      }
      role.name = dto.name;
      role.slug = newSlug;
    }

    // Update other fields
    if (dto.description !== undefined) {
      role.description = dto.description;
    }

    if (dto.permissions) {
      this.validatePermissions(dto.permissions);
      role.permissions = dto.permissions;
    }

    await role.save();

    return this.mapToResponseDto(role);
  }

  /**
   * Delete a role with validation
   */
  async delete(idOrSlug: string): Promise<void> {
    const role = await this.findRoleByIdOrSlug(idOrSlug);

    // Prevent deleting protected roles
    if (role.isProtected) {
      throw new ForbiddenException(
        'Cannot delete protected role. The USER role is immutable.',
      );
    }

    // Check if any users are assigned this role
    const userCount = await this.userModel.countDocuments({
      role: role.slug,
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. ${userCount} user${userCount > 1 ? 's' : ''} assigned. Please reassign users first.`,
      );
    }

    await this.roleModel.deleteOne({ _id: role._id });
  }

  /**
   * Get role by slug (helper method)
   */
  async getRoleBySlug(slug: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ slug }).exec();
  }

  /**
   * Check if role is assigned to any users
   */
  async isRoleAssignedToUsers(roleSlug: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ role: roleSlug });
    return count > 0;
  }

  /**
   * Get user count for a role
   */
  async getUserCount(roleSlug: string): Promise<number> {
    return this.userModel.countDocuments({ role: roleSlug });
  }

  /**
   * Find role by ID or slug (private helper)
   */
  private async findRoleByIdOrSlug(idOrSlug: string): Promise<RoleDocument> {
    let role: RoleDocument | null;

    // Try finding by MongoDB ObjectId first
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      role = await this.roleModel.findById(idOrSlug);
    } else {
      // Otherwise treat as slug
      role = await this.roleModel.findOne({ slug: idOrSlug });
    }

    if (!role) {
      throw new NotFoundException(`Role "${idOrSlug}" not found`);
    }

    return role;
  }

  /**
   * Generate URL-safe slug from role name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Validate permission format
   */
  private validatePermissions(permissions: string[]): void {
    const permissionRegex = /^([a-z-]+:[a-z-]+(:[a-z-]+)?|\*)$/;

    for (const permission of permissions) {
      if (!permissionRegex.test(permission)) {
        throw new BadRequestException(
          `Invalid permission format: "${permission}". Must be resource:action[:scope] or wildcard "*"`,
        );
      }
    }
  }

  /**
   * Map Role document to response DTO
   */
  private mapToResponseDto(
    role: RoleDocument | (Role & { _id: { toString(): string } }),
  ): RoleResponseDto {
    return {
      id: role._id.toString(),
      name: role.name,
      slug: role.slug,
      description: role.description,
      isSystemRole: role.isSystemRole,
      isProtected: role.isProtected,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
