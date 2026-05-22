"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exits", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      exit_type: {
        type: Sequelize.ENUM("Resignation", "Termination"),
        allowNull: false,
      },

      request_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      notice_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      notice_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      notice_status: {
        type: Sequelize.ENUM("Pending", "In Progress", "Completed"),
        allowNull: false,
        defaultValue: "Pending",
      },

      current_stage: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      overall_status: {
        type: Sequelize.ENUM("Pending", "Approved", "Rejected"),
        allowNull: false,
        defaultValue: "Pending",
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      exit_date: {
        type: Sequelize.DATEONLY,
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

    // 🔥 indexes (important for filtering)
    await queryInterface.addIndex("exits", ["company_code"]);
    await queryInterface.addIndex("exits", ["employee_id"]);
    await queryInterface.addIndex("exits", ["overall_status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("exits");
  },
};