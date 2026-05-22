"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("assets", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      asset_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      serial_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      purchase_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      purchase_value: {
        type: Sequelize.DECIMAL(10, 2), //  FIX
        allowNull: true,
        defaultValue: 0,
      },

      condition: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM(
          "available",
          "assigned",
          "maintenance",
          "disposed"
        ),
        allowNull: false,
        defaultValue: "available",
      },

      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      generated_by: {
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

    await queryInterface.addIndex("assets", ["company_code"]);
    await queryInterface.addIndex("assets", ["status"]);
    await queryInterface.addIndex("assets", ["assigned_to"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("assets");

    //  ENUM cleanup (important for MySQL)
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_assets_status;"
    );
  },
};