"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("policies", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 🔥 indexes
    await queryInterface.addIndex("policies", ["company_code"]);
    await queryInterface.addIndex("policies", ["department"]);
    await queryInterface.addIndex("policies", ["role"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("policies");
  },
};