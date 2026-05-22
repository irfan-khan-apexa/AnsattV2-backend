"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      actor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      actor_role: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      module: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      record_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      old_value: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      new_value: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 🔥 indexes (important for logs filtering)
    await queryInterface.addIndex("audit_logs", ["company_code"]);
    await queryInterface.addIndex("audit_logs", ["actor_id"]);
    await queryInterface.addIndex("audit_logs", ["module"]);
    await queryInterface.addIndex("audit_logs", ["action"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
  },
};