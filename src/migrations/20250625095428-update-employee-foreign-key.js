'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the foreign key if it exists
    // You can only drop a constraint by name
    await queryInterface.removeConstraint('employees', 'fk_company_code').catch(() => {
      console.log('No existing constraint fk_company_code to drop');
    });

    // Add new foreign key with updated rules
    await queryInterface.addConstraint('employees', {
      fields: ['company_code'],
      type: 'foreign key',
      name: 'fk_company_code', // custom name (important!)
      references: {
        table: 'companies',
        field: 'company_code',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('employees', 'fk_company_code');
  }
};
