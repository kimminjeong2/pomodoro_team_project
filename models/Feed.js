/**
 * feed 모델을 정의하는 함수
 * @param {import("sequelize").Sequelize} Sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */

const feed = (Sequelize, DataTypes) => {
  const Feed = Sequelize.define(
    "feed",
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
          model: "users", // User 모델의 테이블 이름과 일치시켜야 합니다.
          key: "id",
        },
        onDelete: "CASCADE", // 사용자가 삭제되면 관련 게시글도 삭제
        onUpdate: "CASCADE",
      },
      content: {
        type: DataTypes.STRING(255),
      },
      file_url: {
        // S3 파일 URL을 저장하는 필드
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true, // create_at과 update_at을 자동 생성
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // 모델 간 관계 정의
  Feed.associate = (models) => {
    Feed.belongsTo(models.User, {
      // Feed는 하나의 User에 속함
      foreignKey: "user_id", // foreign key
      targetKey: "id", // target key (User 모델의 id와 매칭)
    });
  };

  return Feed;
};

module.exports = feed;
