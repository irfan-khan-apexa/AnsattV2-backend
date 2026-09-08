"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("custom_documents", {
      id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      doc_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      sections: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      section_list: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      logo_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 80,
      },

      logo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      pos: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      font_family: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "sans-serif",
      },

      page_border: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      is_draft: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Indexes
    await queryInterface.addIndex(
      "custom_documents",
      ["company_code"]
    );

    await queryInterface.addIndex(
      "custom_documents",
      ["generated_by"]
    );

    await queryInterface.addIndex(
      "custom_documents",
      ["is_draft"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "custom_documents"
    );
  },
};