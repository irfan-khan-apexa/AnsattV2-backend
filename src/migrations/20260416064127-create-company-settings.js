"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("company_settings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      company_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      company_logo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      brand_color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "#670edcff",
      },

      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "en",
      },

      permissions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          onboarding: ["read", "create", "update", "delete"],
          leaves: ["read", "create"],
          assets: ["read", "create", "update"],
          salary: [],
          hrAnnouncement: ["read"],
          roles: ["read", "create"],
        },
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

    // 🔥 index
    await queryInterface.addIndex("company_settings", ["company_code"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("company_settings");
  },
};