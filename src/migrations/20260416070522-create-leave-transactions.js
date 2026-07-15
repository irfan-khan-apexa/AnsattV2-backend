"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("leave_transactions", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      employeeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      noOfDays: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      // ==========================
      // LWP Fields
      // ==========================

      paidDays: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      lwpDays: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      isLwp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },

      document: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      extraFields: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      actionBy: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      actionReason: {
        type: Sequelize.STRING,
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

    // Indexes
    await queryInterface.addIndex("leave_transactions", ["companyCode"]);
    await queryInterface.addIndex("leave_transactions", ["employeeId"]);
    await queryInterface.addIndex("leave_transactions", ["status"]);
    await queryInterface.addIndex("leave_transactions", ["isLwp"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("leave_transactions");
  },
};