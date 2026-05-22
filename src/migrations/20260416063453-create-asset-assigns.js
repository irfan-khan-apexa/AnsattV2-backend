"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("asset_assigns", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      asset_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      issued_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      returned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      issued_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      returned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      condition_on_return: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("issued", "returned"), // 🔥 controlled values
        allowNull: false,
        defaultValue: "issued",
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

    // 🔥 indexes (important for queries)
    await queryInterface.addIndex("asset_assigns", ["asset_id"]);
    await queryInterface.addIndex("asset_assigns", ["employee_id"]);
    await queryInterface.addIndex("asset_assigns", ["company_code"]);
    await queryInterface.addIndex("asset_assigns", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("asset_assigns");
  },
};