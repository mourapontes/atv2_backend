const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Feedback extends Model {}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O comentário não pode ser vazio.' },
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'rating deve ser no mínimo 1.' },
        max: { args: [5], msg: 'rating deve ser no máximo 5.' },
      },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    timestamps: true,
  }
);

module.exports = Feedback;
