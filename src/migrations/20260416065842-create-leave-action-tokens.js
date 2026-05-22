"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("leave_action_tokens", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      leaveId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("approve", "reject"),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // 🔥 indexes (important)
    await queryInterface.addIndex("leave_action_tokens", ["leaveId"]);
    await queryInterface.addIndex("leave_action_tokens", ["token"]);
    await queryInterface.addIndex("leave_action_tokens", ["email"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("leave_action_tokens");
  },
};