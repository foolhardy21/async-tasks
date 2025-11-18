'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uploaded_image: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      thumbnail_image: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
