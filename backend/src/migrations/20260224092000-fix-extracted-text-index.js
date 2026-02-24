'use strict';

/**
 * Fix: Replace the B-tree index on extracted_text with a GIN full-text search index.
 *
 * The original B-tree index fails with:
 *   "index row requires N bytes, maximum size is 8191"
 * because PostgreSQL B-tree indexes cannot handle values larger than ~8 KB.
 *
 * The correct approach for large TEXT columns is a GIN index using to_tsvector,
 * which supports full-text search and has no row-size limit.
 */
module.exports = {
  async up(queryInterface) {
    // 1. Drop the broken B-tree index (ignore error if it doesn't exist)
    try {
      await queryInterface.removeIndex('documents', 'idx_documents_extracted_text');
    } catch (e) {
      // Index may not exist if migration was never fully applied — that's fine
    }

    // 2. Add a GIN full-text search index instead
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_extracted_text_fts
      ON documents
      USING GIN (to_tsvector('english', COALESCE(extracted_text, '')));
    `);
  },

  async down(queryInterface) {
    // Remove the GIN index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_documents_extracted_text_fts;
    `);

    // Restore the original (broken) B-tree index so the down migration is reversible
    await queryInterface.addIndex('documents', ['extracted_text'], {
      name: 'idx_documents_extracted_text',
      where: { extracted_text: { $ne: null } }
    });
  }
};
