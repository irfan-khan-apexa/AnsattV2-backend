"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("SUPER_ADMIN", "COMPANY", "EMPLOYEE"),
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: true, // null for super admin
      },

      permissions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
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
    await queryInterface.addIndex("roles", ["company_code"]);
    await queryInterface.addIndex("roles", ["type"]);
    await queryInterface.addIndex("roles", ["name"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("roles");
  },
};