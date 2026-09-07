const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Project extends Model {}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título não pode ser vazio.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repositoryUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: { msg: 'repositoryUrl deve ser uma URL válida.' },
        notEmpty: { msg: 'repositoryUrl não pode ser vazio.' },
      },
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id',
      },
    },
    averageRating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    upvotes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
  }
);

module.exports = Project;
