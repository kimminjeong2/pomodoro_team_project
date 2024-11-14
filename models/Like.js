/**
 * likes 모델을 정의하는 함수
 * @param {import("sequelize").Sequelize} Sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */

const like = (Sequelize, DataTypes) => {
  const Likes = Sequelize.define(
    "like",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",  // User 모델의 테이블 이름과 일치시켜야 합니다.
          key: "id",
        },
        onDelete: "CASCADE", // 사용자가 삭제되면 관련 좋아요 기록도 삭제
        onUpdate: "CASCADE",
      },
      feed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "feeds",  // Feed 모델의 테이블 이름과 일치시켜야 합니다.
          key: "id",
        },
        onDelete: "CASCADE", // 피드가 삭제되면 관련 좋아요 기록도 삭제
        onUpdate: "CASCADE",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false, // created_at 필드만 사용 (수정 날짜는 필요 없음)
      tableName: "likes",
    }
  );

  // 모델 간 관계 정의
  Likes.associate = (models) => {
    Likes.belongsTo(models.User, {  // 좋아요는 하나의 User에 속함
      foreignKey: "user_id",        // foreign key
      targetKey: "id",              // target key (User 모델의 id와 매칭)
    });
    Likes.belongsTo(models.Feed, {  // 좋아요는 하나의 Feed에 속함
      foreignKey: "feed_id",        // foreign key
      targetKey: "id",              // target key (Feed 모델의 id와 매칭)
    });
  };

  return Likes;
};

module.exports = like;
