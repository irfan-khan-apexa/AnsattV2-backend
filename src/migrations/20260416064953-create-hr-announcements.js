"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hr_announcements", {
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
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("info", "notice", "alert", "policy"),
        allowNull: false,
        defaultValue: "info",
      },

      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
      },

      publish_from: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      publish_till: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_by: {
        type: Sequelize.INTEGER,
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

    // 🔥 indexes (important for filtering)
    await queryInterface.addIndex("hr_announcements", ["company_code"]);
    await queryInterface.addIndex("hr_announcements", ["type"]);
    await queryInterface.addIndex("hr_announcements", ["priority"]);
    await queryInterface.addIndex("hr_announcements", ["is_active"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hr_announcements");
  },
};