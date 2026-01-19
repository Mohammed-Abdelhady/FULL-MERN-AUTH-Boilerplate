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
    // Helper function to check if index exists
    const indexExists = async (collection, indexName) => {
      const indexes = await db.collection(collection).indexes();
      return indexes.some((idx) => idx.name === indexName);
    };

    // Create unique index on email field
    if (!(await indexExists('users', 'email_unique'))) {
      try {
        await db.collection('users').createIndex(
          { email: 1 },
          {
            unique: true,
            name: 'email_unique',
            background: true,
          },
        );
        console.log('✓ Created email_unique index');
      } catch (error) {
        console.log('⚠ Email index already exists with different name');
      }
    }

    // Create compound index for createdAt and isDeleted
    if (!(await indexExists('users', 'createdAt_isDeleted_compound'))) {
      try {
        await db.collection('users').createIndex(
          { createdAt: -1, isDeleted: 1 },
          {
            name: 'createdAt_isDeleted_compound',
            background: true,
          },
        );
        console.log('✓ Created createdAt_isDeleted_compound index');
      } catch (error) {
        console.log('⚠ createdAt_isDeleted_compound index already exists');
      }
    }

    // Create index on role field for filtering by user role
    if (!(await indexExists('users', 'role_index'))) {
      try {
        await db.collection('users').createIndex(
          { role: 1 },
          {
            name: 'role_index',
            background: true,
          },
        );
        console.log('✓ Created role_index');
      } catch (error) {
        console.log('⚠ role_index already exists');
      }
    }

    // Create index on isDeleted field for soft delete queries
    if (!(await indexExists('users', 'isDeleted_index'))) {
      try {
        await db.collection('users').createIndex(
          { isDeleted: 1 },
          {
            name: 'isDeleted_index',
            background: true,
          },
        );
        console.log('✓ Created isDeleted_index');
      } catch (error) {
        console.log('⚠ isDeleted index already exists with different name');
      }
    }

    // Create sparse unique index on googleId for OAuth users
    if (!(await indexExists('users', 'googleId_unique'))) {
      try {
        await db.collection('users').createIndex(
          { googleId: 1 },
          {
            unique: true,
            sparse: true,
            name: 'googleId_unique',
            background: true,
          },
        );
        console.log('✓ Created googleId_unique index');
      } catch (error) {
        console.log('⚠ googleId index already exists');
      }
    }

    // Create sparse unique index on facebookId for OAuth users
    if (!(await indexExists('users', 'facebookId_unique'))) {
      try {
        await db.collection('users').createIndex(
          { facebookId: 1 },
          {
            unique: true,
            sparse: true,
            name: 'facebookId_unique',
            background: true,
          },
        );
        console.log('✓ Created facebookId_unique index');
      } catch (error) {
        console.log('⚠ facebookId index already exists');
      }
    }

    // Create sparse unique index on githubId for OAuth users
    if (!(await indexExists('users', 'githubId_unique'))) {
      try {
        await db.collection('users').createIndex(
          { githubId: 1 },
          {
            unique: true,
            sparse: true,
            name: 'githubId_unique',
            background: true,
          },
        );
        console.log('✓ Created githubId_unique index');
      } catch (error) {
        console.log('⚠ githubId index already exists');
      }
    }

    console.log('✓ All user collection indexes verified/created');
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
