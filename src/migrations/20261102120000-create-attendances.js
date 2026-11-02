"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attendances", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      employee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      inTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      outTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      durationHours: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      overtimeHours: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      note: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("PUNCH_IN", "PUNCH_OUT"),
        allowNull: false,
      },

      isManual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      latitude: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      longitude: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      distance: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      isInsideGeofence: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },

      isWFH: {
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

    await queryInterface.addIndex("attendances", ["employee_id"]);
    await queryInterface.addIndex("attendances", ["company_code"]);
    await queryInterface.addIndex("attendances", ["inTime"]);
    await queryInterface.addIndex("attendances", ["isWFH"]);
    await queryInterface.addIndex("attendances", [
      "employee_id",
      "company_code",
      "outTime",
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("attendances");
  },
};
