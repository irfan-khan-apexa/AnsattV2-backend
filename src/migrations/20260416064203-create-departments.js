"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("departments", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyCode: { // ⚠️ same as model (camelCase)
        type: Sequelize.STRING,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      HrId: {
        type: Sequelize.INTEGER.UNSIGNED,
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
    await queryInterface.addIndex("departments", ["companyCode"]);
    await queryInterface.addIndex("departments", ["HrId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("departments");
  },
};