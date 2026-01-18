/**
 * Migration: Initial Indexes
 *
 * This migration creates essential database indexes for the user collection
 * to improve query performance and ensure data integrity.
 *
 * Indexes created:
 * - email: Unique index for fast email lookups
 * - createdAt: Compound index for sorting by creation date
 * - isDeleted: Index for filtering deleted users
 *
 * @param {Db} db - MongoDB database instance
 * @param {MongoClient} client - MongoDB client instance
 */

module.exports = {
  async up(db, client) {
    // Create unique index on email field
    await db.collection('users').createIndex(
      { email: 1 },
      {
        unique: true,
        name: 'email_unique',
        background: true,
      },
    );

    // Create compound index for createdAt and isDeleted
    await db.collection('users').createIndex(
      { createdAt: -1, isDeleted: 1 },
      {
        name: 'createdAt_isDeleted_compound',
        background: true,
      },
    );

    // Create index on role field for filtering by user role
    await db.collection('users').createIndex(
      { role: 1 },
      {
        name: 'role_index',
        background: true,
      },
    );

    // Create index on isDeleted field for soft delete queries
    await db.collection('users').createIndex(
      { isDeleted: 1 },
      {
        name: 'isDeleted_index',
        background: true,
      },
    );

    // Create sparse unique index on googleId for OAuth users
    await db.collection('users').createIndex(
      { googleId: 1 },
      {
        unique: true,
        sparse: true,
        name: 'googleId_unique',
        background: true,
      },
    );

    // Create sparse unique index on facebookId for OAuth users
    await db.collection('users').createIndex(
      { facebookId: 1 },
      {
        unique: true,
        sparse: true,
        name: 'facebookId_unique',
        background: true,
      },
    );

    // Create sparse unique index on githubId for OAuth users
    await db.collection('users').createIndex(
      { githubId: 1 },
      {
        unique: true,
        sparse: true,
        name: 'githubId_unique',
        background: true,
      },
    );

    console.log('✓ Created all user collection indexes');
  },

  async down(db, client) {
    // Drop all indexes created in the up migration
    await db.collection('users').dropIndex('email_unique');
    await db.collection('users').dropIndex('createdAt_isDeleted_compound');
    await db.collection('users').dropIndex('role_index');
    await db.collection('users').dropIndex('isDeleted_index');
    await db.collection('users').dropIndex('googleId_unique');
    await db.collection('users').dropIndex('facebookId_unique');
    await db.collection('users').dropIndex('githubId_unique');

    console.log('✓ Dropped all user collection indexes');
  },
};
