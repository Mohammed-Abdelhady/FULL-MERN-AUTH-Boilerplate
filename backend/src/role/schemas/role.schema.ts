import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

/**
 * Role schema for dynamic role management system.
 * Supports custom roles with granular permission assignments.
 */
@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: false })
  isSystemRole!: boolean;

  @Prop({ default: false })
  isProtected!: boolean;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  // Timestamp fields (automatically managed by Mongoose with timestamps: true)
  createdAt!: Date;
  updatedAt!: Date;
}

export type RoleDocument = HydratedDocument<Role>;

export const RoleSchema: MongooseSchema<Role> =
  SchemaFactory.createForClass(Role);

// Indexes for performance
RoleSchema.index({ slug: 1 }, { unique: true });
RoleSchema.index({ isSystemRole: 1 });
RoleSchema.index({ createdAt: -1 });

// Ensure slug is always lowercase
RoleSchema.pre('save', function (next) {
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().trim();
  }
  next();
});
