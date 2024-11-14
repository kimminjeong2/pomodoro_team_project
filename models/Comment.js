/**
 * comment 모델을 정의하는 함수
 * @param {import("sequelize").Sequelize} Sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */

const comment = (Sequelize, DataTypes) => {
  const Comment = Sequelize.define(
    "comment",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      feed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "feeds",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true, // created_at 자동생성
      createdAt: "created_at",
    }
  );

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: "user_id" }); // User 모델과 N:1 관계
    Comment.belongsTo(models.Feed, { foreignKey: "feed_id" }); // Feed 모델과 N:1 관계
  };

  return Comment;
};

module.exports = comment;
