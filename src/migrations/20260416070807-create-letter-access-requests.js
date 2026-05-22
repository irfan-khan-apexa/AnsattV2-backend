"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("letter_access_requests", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      letter_type: {
        type: Sequelize.ENUM(
          "offer_letter",
          "joining_letter",
          "experience_letter",
          "exit_letter"
        ),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Pending", "Approved", "Rejected"),
        allowNull: false,
        defaultValue: "Pending",
      },

      requested_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      actioned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      actioned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });

    // 🔥 indexes
    await queryInterface.addIndex("letter_access_requests", ["company_code"]);
    await queryInterface.addIndex("letter_access_requests", ["employee_id"]);
    await queryInterface.addIndex("letter_access_requests", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("letter_access_requests");
  },
};