"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wfh_requests", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      employee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      department_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      reason: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
      },

      approved_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex("wfh_requests", [
      "company_code",
      "employee_id",
    ]);

    await queryInterface.addIndex("wfh_requests", ["company_code", "status"]);

    await queryInterface.addIndex("wfh_requests", ["start_date", "end_date"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wfh_requests");
  },
};
