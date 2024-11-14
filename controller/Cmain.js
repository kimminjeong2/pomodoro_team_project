const db = require("../models/index");
const User = require("../models/index").User;
const Task = require("../models/index").Task;
const Timer = require("../models/index").Timer;
const Feed = require("../models/index").Feed;
const Like = require("../models/index").Like;
const { Op, Sequelize } = require("sequelize");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;
const path = require("path");
const fs = require("fs");

require("dotenv").config();

// 비밀번호 암호화
const bcrypt = require("bcrypt");
const plainpassword = "user_password";
const saltRounds = 10;

bcrypt.hash(plainpassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password", err);
    return;
  }
});

const multer = require("multer");
const { log } = require("console");

const e = require("express");
const feed = require("../models/Feed");

// Multer 설정 (파일을 uploads/ 디렉터리에 저장)
const upload = multer({ dest: "uploads/" });

// s3 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// multer 세부 설정
const uploadDetail = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      // 파일이름에 uuid 설정
      // const ext = path.extname(file.originalname);
      const uniqueName = uuid() + path.extname(file.originalname);
      done(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB
  fileFilter(req, file, done) {
    // 확장자 검사
    // 정규표현식 업로드 허용된 파일 확장자 목록
    const allowedTypes = /jpeg|jpg|png|bmp/;
    // 파일의 확장자를 추출하는 코드
    // toLowerCase() 확장자를 소문자로 변환하여 대소문자 구분없이 검사 가능
    // JPG나 jpg
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // MIME 타입이 image/jpeg image/png 검사함
    // 조건이 맞으면 true 아니면 false
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return done(null, true);
    } else {
      return done(new Error("허용되지 않는 확장자 입니다."));
    }
  },
});
exports.get_modal = (req, res) => {
  res.send("example");
};

// 파일 s3에 업로드
const uploadToS3 = async (filePath, bucketName, keyName) => {
  try {
    // 업로드할 파일 경로 및 내용 준비
    const fileStream = fs.createReadStream(filePath);

    // s3에 업로드할 객체 설정
    const uploadParms = {
      Bucket: bucketName,
      Key: keyName,
      Body: fileStream,
    };

    // s3에 파일 업로드
    const data = await s3.send(new PutObjectCommand(uploadParms));
    return `https://${bucketName}.s3.amazonaws.com/${keyName}`;
  } catch (err) {
    console.error("Error uploading file to S3", err);
    throw err; // 에러 처리
  }
};

// 이미지가 수정되면 기존 s3에 있는 이미지 삭제
async function deleteImageFromS3(bucketName, ImageUrl) {
  const imageKey = ImageUrl.split(".amazonaws.com/")[1];

  const params = {
    Bucket: bucketName,
    Key: imageKey,
  };
  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    console.error("이미지 삭제 실패", error);
    throw new Error("이미지 삭제에 실패하였습니다.");
  }
}

exports.get_Index = async (req, res) => {
  const userNickName = req.session.nickname;
  const userId = req.session.userId;

  if (userNickName) {
    try {
      const limit = 3;
      const offset = 0; // 첫 페이지에 대한 오프셋

      // 첫 페이지 피드 데이터 가져오기
      const feeds = await Feed.findAll({
        attributes: ["id", "content", "file_url", "user_id"],
        include: [
          {
            model: require("../models/index").User,
            attributes: ["nickname"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
      });
      // 사용자 정보
      const userData = await User.findOne({
        where: {
          id: userId,
        },
      });
      let profileImg;
      if (userData.profile_image) {
        profileImg = userData.profile_image;
      } else {
        profileImg = "/static/img/profile.png";
      }
      res.render("index", {
        feeds,
        userNickName,
        profileImg: profileImg,
      });
    } catch (error) {
      console.error("Error fetching initial feeds : ", error);
      res.status(500).send("Error loading initial page");
    }
  } else {
    res.render("loading");
  }
};

exports.get_Login = (req, res) => {
  res.render("login");
};

exports.post_Login = async (req, res) => {
  const { emailAddr, password } = req.body;

  // 입력 값 검증
  if (!emailAddr || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 이메일로 사용자 검색
    const user = await User.findOne({ where: { emailAddr } });
    // 사용자가 존재하지 않거나 비밀번호가 틀린 경우
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ message: "이메일 또는 비밀번호를 확인 해 주세요." });
    }

    // 로그인 성공
    req.session.userId = user.id; // 사용자 id값 저장
    req.session.username = user.username; // 사용자 이름값 저장
    req.session.nickname = user.nickname; // 사용자 닉네임값 저장
    // 로그인 성공 시 세션 설정
    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in", error);
    return res
      .status(500)
      .json({ success: false, message: "Error logging in" });
  }
};

exports.get_Register = async (req, res) => {
  res.render("register");
};

exports.post_Register = async (req, res) => {
  const {
    username,
    nickname,
    emailAddr,
    password,
    password_confirm,
    phoneNumber,
  } = req.body;

  const errors = {};

  // 비밀번호와 비밀번호 확인 값이 일치하는지 확인
  if (password !== password_confirm) {
    errors.password_confirm = "패스워드가 일치하지 않습니다.";
  }

  try {
    // 중복 검사
    const existingEmail = await User.findOne({ where: { emailAddr } });
    if (existingEmail) {
      errors.emailAddr = "이미 존재하는 이메일입니다.";
    }

    const existingNickname = await User.findOne({ where: { nickname } });
    if (existingNickname) {
      errors.nickname = "이미 존재하는 닉네임입니다.";
    }

    const existingPhoneNumber = await User.findOne({ where: { phoneNumber } });
    if (existingPhoneNumber) {
      errors.phoneNumber = "이미 존재하는 휴대전화 번호입니다.";
    }

    // 오류가 있으면 반환
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await User.create({
      username,
      emailAddr,
      password: hashedPassword,
      nickname,
      phoneNumber,
    });

    return res.json({
      success: true,
      message: "Register successful",
      username: user.username, // 회원가입한 사람의 username을 반환
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.get_Find = (req, res) => {
  res.render("find");
};

exports.post_FindEmail = async (req, res) => {
  const { username, phoneNumber } = req.body;

  try {
    const user = await User.findOne({
      where: { username, phoneNumber },
    });

    const userByName = await User.findOne({ where: { username: username } });
    const userByPhoneNumber = await User.findOne({ where: { phoneNumber } });

    if (user) {
      // 이름과 전화번호 모두 일치하면 이메일 반환
      return res.status(200).json({ emailAddr: user.emailAddr });
    } else {
      // 이름만 틀린 경우
      if (!userByName && userByPhoneNumber) {
        return res.status(404).json({
          error: "username",
          message: "해당 이름을 가진 사용자를 찾을 수 없습니다.",
        });
      }

      // 전화번호가 틀린 경우
      if (!userByPhoneNumber && userByName) {
        return res.status(404).json({
          error: "phoneNumber",
          message: "해당 휴대전화번호를 가진 사용자를 찾을 수 없습니다.",
        });
      }

      if (!userByName && !userByPhoneNumber) {
        // 이름과 전화번호가 모두 틀린 경우
        return res.status(404).json({
          error: "mismatch",
          message: "이름과 전화번호가 일치하지 않습니다.",
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

exports.post_ResetPassword = async (req, res) => {
  const { username, phoneNumber, emailAddr } = req.body;

  try {
    // 이름, 전화번호, 이메일로 사용자를 조회
    const user = await User.findOne({
      where: { username, phoneNumber, emailAddr },
    });

    const userByName = await User.findOne({ where: { username: username } });
    const userByPhoneNumber = await User.findOne({ where: { phoneNumber } });
    const userByEmailAddr = await User.findOne({ where: { emailAddr } });

    if (user) {
      return res.status(200).json({
        success: true,
        message: "사용자가 조회되었습니다. 비밀번호 변경을 진행합니다.",
        showResetModal: true,
        userId: user.id, // 사용자 ID를 반환
        emailAddr: user.emailAddr,
      });
    }

    // 이름만 틀린 경우
    if (!userByName && userByPhoneNumber && userByEmailAddr) {
      return res.status(404).json({
        error: "username",
        message: "해당 이름을 가진 사용자를 찾을 수 없습니다.",
      });
    }

    // 전화번호만 틀린 경우
    if (!userByPhoneNumber && userByName && userByEmailAddr) {
      return res.status(404).json({
        error: "phoneNumber",
        message: "해당 휴대전화번호를 가진 사용자를 찾을 수 없습니다.",
      });
    }

    // 이메일만 틀린 경우
    if (!userByEmailAddr && userByName && userByPhoneNumber) {
      return res.status(404).json({
        error: "emailAddr",
        message: "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
      });
    }

    // 이름, 전화번호 틀린 경우
    if (!userByName && !userByPhoneNumber && userByEmailAddr) {
      return res.status(404).json({
        error: "username & phoneNumber",
        message: "해당 이름과 휴대전화번호를 가진 사용자를 찾을 수 없습니다.",
      });
    }

    // 이름, 이메일 틀린 경우
    if (!userByName && !userByEmailAddr && userByPhoneNumber) {
      return res.status(404).json({
        error: "username & emailAddr",
        message: "해당 이름과 이메일을 가진 사용자를 찾을 수 없습니다.",
      });
    }

    // 전화번호, 이메일 틀린 경우
    if (!userByPhoneNumber && !userByEmailAddr && userByName) {
      return res.status(404).json({
        error: "phoneNumber & emailAddr",
        message: "해당 휴대전화번호와 이메일을 가진 사용자를 찾을 수 없습니다.",
      });
    }

    // 이름과 전화번호가 모두 틀린 경우
    if (!userByName && !userByPhoneNumber && !userByEmailAddr) {
      return res.status(404).json({
        error: "mismatch",
        message: "이름, 전화번호, 이메일이 일치하지 않습니다.",
      });
    }
  } catch (error) {
    console.error("Error in post_ResetPassword:", error); // 정확한 에러 메세지 확인
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

exports.update_Password = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "사용자 ID와 새 비밀번호를 모두 제공해야 합니다." });
  }

  try {
    // 새 비밀번호 해싱 처리
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트 시 에러가 발생할 수 있으므로
    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );

    if (updated) {
      return res
        .status(200)
        .json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    } else {
      return res.status(400).json({ message: "비밀번호 변경에 실패했습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "비밀번호 변경에 실패했습니다." });
  }
};

exports.get_Feed = (req, res) => {
  res.render("feed");
};

// 피드 업로드
exports.post_feedUpload = (req, res) => {
  // multer 를 사용하여 파일 업로드
  // 문제해결
  // form 데이터를 가져왔을때 이미지와 본문 내용을 가져오면
  // 이미지 업로드를 먼저처리한뒤 body 값을 가져와야한다.
  // req bdoy 값을 먼저 가져오면 해당값이 비어있어 값을 가져오지 못하게 됨
  uploadDetail.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "file upload failed", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { content } = req.body;
    // 세션에서 userId 값을 불러오기
    const { userId } = req.session;

    try {
      const filename = req.file.filename;
      const filePath = req.file.path;
      const bucketName = "feeduploadimg";
      const keyName = `images/${filename}`;

      // S3에 파일 업로드
      const fileUrl = await uploadToS3(filePath, bucketName, keyName);

      // db에 게시글 정보와 함꼐 파일 url 및 사용자의 id 저장
      const feedData = {
        content: content,
        file_url: fileUrl, // 컬럼명 수정
        user_id: userId, // user_id로 수정
      };

      // DB에 피드 데이터 저장
      const feed = await Feed.create(feedData);

      try {
        // 업로드 후 임시파일 삭제
        fs.unlinkSync(filePath);
      } catch (unlinkSync) {
        console.err("failed to delete file", unlinkErr);
      }

      //성공 응답
      res.status(200).json({ message: "feed uploaded success", fileUrl });
    } catch (err) {
      console.log("error during feed upload", err);
      res
        .status(500)
        .json({ error: "failed to upload feed", details: err.message });
    }
  });
};

// 피드 목록 가져오기 [ 페이징 ]
exports.get_Feeds = async (req, res) => {
  const feedNickname = req.session.nickname;

  try {
    // 요청받은 페이지 정보
    const page = parseInt(req.query.page);
    const limit = 3; // 한페이지에 보여줄 피드 개수
    const offset = (page - 1) * limit;

    // 피드 데이터 조회
    const feeds = await Feed.findAll({
      attributes: ["id", "content", "file_url", "user_id"],
      include: [
        {
          model: require("../models/index").User,
          attributes: ["nickname"], // 유저 닉네임
        },
      ],
      order: [["created_at", "DESC"]], // 최신 피드 순으로 정렬
      limit: limit, // 한 페이지에 3개 피드
      offset: offset, // 페이지에 맞는 offset 적용
    });

    // JSON 데이터 반환
    res.json({ feeds, feedNickname });
  } catch (error) {
    console.error("Error fetching feeds :", error);
    res.status(500).json({ message: "Error fetching feeds" });
  }
};

// 피드 수정
exports.post_FeedUpdate = async (req, res) => {
  try {
    const { feedId, content } = req.body; // 수정할 피드 ID와 내용
    const newImage = req.file; // 새로 업로드된 이미지

    // 피드 찾기
    const feed = await Feed.findOne({ where: { id: feedId } });
    if (!feed) {
      return res.status(404).json({ error: "피드를 찾을 수 없습니다." });
    }

    let newImageUrl = feed.file_url; // 기존 이미지 URL

    // 새 이미지가 있을 경우, 기존 이미지 삭제 후 S3에 새 이미지 업로드
    if (newImage) {
      // 기존 이미지 URL을 사용하여 S3에서 삭제
      if (feed.file_url) {
        const bucketName = "feeduploadimg";
        await deleteImageFromS3(bucketName, feed.file_url); // 기존 이미지를 S3에서 삭제
      }

      // 새 이미지 파일 로컬 저장소에서 S3로 업로드
      const filePath = path.join(__dirname, "../uploads/", newImage.filename);
      const filename = req.file.filename;
      const bucketName = "feeduploadimg";
      const keyName = `images/${filename}`;
      newImageUrl = await uploadToS3(filePath, bucketName, keyName); // 새 이미지 S3에 업로드 후 URL 반환

      // 로컬 파일 삭제 (S3 업로드 후 삭제)
      fs.unlink(filePath, (err) => {
        if (err) "로컬파일 삭제 오류", err;
      });
    }

    // 피드 내용 업데이트
    feed.content = content; // 본문 내용 수정
    feed.file_url = newImageUrl; // 새 이미지 URL로 수정

    // 피드 저장
    await feed.save();

    // 응답
    res.status(200).json({ content, newImageUrl });
  } catch (error) {
    console.log("피드 수정 실패", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
};

// 피드 삭제
exports.del_FeedDelete = async (req, res) => {
  try {
    const feedId = req.params.id;
    // 피드 ID 값이 없을때
    if (!feedId) {
      return res.status(400).json({ error: "피드 ID 값이 없습니다." });
    }

    // db에서 피드 삭제
    const deleteFeed = await Feed.destroy({
      where: { id: feedId },
    });

    // 삭제될 행이 없을 경우 - 존재하지 않는 피드
    if (!deleteFeed) {
      return res.status(404).json({ error: "삭제할 피드가 존재하지 않음" });
    }

    // 성공 메시지 응답
    return res
      .status(200)
      .json({ message: "피드가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "피드를 삭제하는 중 오류가 발생하였습니다." });
  }
};

// 좋아요 상태 확인을 위한 API
exports.get_LikeStatus = async (req, res) => {
  const userId = req.session.userId; // 로그인한 사용자 ID
  try {
    // likes 테이블에서 현재 사용자(userId)가 좋아요한 feedId 목록 조회
    const likes = await Like.findAll({
      where: { user_id: userId },
      attributes: ["feed_id"], // 피드 ID만 가져옵니다.
    });

    // feedId 목록 생성
    const likedFeedIds = likes.map((like) => like.feed_id);

    // 서버에서 모든 피드 ID를 가져오는 방법 필요 (예시)
    const allFeeds = await Feed.findAll({
      attributes: ["id"], // 피드 ID만 가져옵니다.
    });

    // 모든 피드에 대해 좋아요 상태를 포함한 리스트 생성
    const allFeedLikeStatus = allFeeds.map((feed) => ({
      feedId: feed.id,
      liked: likedFeedIds.includes(feed.id), // 좋아요 상태 여부
    }));

    // 클라이언트로 좋아요 상태를 응답
    res.json(allFeedLikeStatus);
  } catch (error) {
    console.log("Failed to check like status", error);
    res.status(500).json({ message: "Error checking like status" });
  }
};

// 좋아요 상태 토글을 위한 API
exports.toggleLike = async (req, res) => {
  const userId = req.session.userId; // 로그인한 사용자 ID
  const feedId = req.query.feedId; // 클릭된 피드 ID

  try {
    // 좋아요 상태 확인
    const existingLike = await Like.findOne({
      where: { user_id: userId, feed_id: feedId },
    });

    if (existingLike) {
      // 좋아요가 이미 눌러져 있으면 삭제
      await existingLike.destroy();
      return res.json({ liked: false }); // 좋아요 상태 변경
    } else {
      // 좋아요가 안 눌러져 있으면 추가
      await Like.create({ user_id: userId, feed_id: feedId });
      return res.json({ liked: true }); // 좋아요 상태 변경
    }
  } catch (error) {
    console.error("Failed to toggle like", error);
    res.status(500).json({ message: "Error toggling like" });
  }
};

// 좋아요 갯수와 사용자 목록 가져오기
exports.get_likesUsers = async (req, res) => {
  const feedId = req.params.feedId;

  try {
    // 좋아요 갯수 확인
    const likeCount = await Like.count({
      where: {
        feed_id: feedId,
      },
    });

    // 좋아요 누른 사용자 조회
    const users = await Like.findAll({
      attributes: [
        [Sequelize.col("user.nickname"), "nickname"],
        [Sequelize.col("user.profile_image"), "profile_image"],
      ],
      where: {
        feed_id: feedId,
      },
      include: [
        {
          model: User,
          attributes: [],
        },
      ],
    });

    // 사용자 데이터 가공
    const userList = users.map((user) => ({
      nickname: user.dataValues.nickname,
      profile_image: user.dataValues.profile_image,
    }));

    res.json({
      likeCount: likeCount,
      users: userList,
    });
  } catch (error) {
    console.log("Error data error", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
};

// 각 피드마다 좋아요 개수 가져오기
// 좋아요 개수 조회를 위한 함수
exports.get_likeCount = async (req, res) => {
  const feedId = req.query.feedId; // 클라이언트에서 전달한 피드 ID

  try {
    // feedId에 대한 좋아요 개수를 조회
    const likeCount = await Like.count({
      where: { feed_id: feedId },
    });

    // 좋아요 개수를 클라이언트에 응답
    res.json({ feedId, likeCount });
  } catch (error) {
    console.error("Failed to get like count", error);
    res.status(500).json({ message: "Error fetching like count" });
  }
};
// 하나의 피드에 대해 좋아요 최신화
exports.get_feedlike = async (req, res) => {
  const feedId = req.query.feedId;

  try {
    const likeCnt = await Like.count({
      where: { feed_id: feedId },
    });
    // 좋아요 수 클라이언트 전달
    res.json({ feedId, likeCnt });
  } catch (error) {
    console.error("좋아요 최신화 실패", error);
    res.status(500).json({ message: "error" });
  }
};

// 댓글 작성
exports.post_Comment = async (req, res) => {
  const { commentText, feedId } = req.body;
  const userId = req.session.userId;

  // 입력값 유효성 검사
  if (!user_id || !feed_id || !comment) {
    return res.status(400).json({ error: "잘못된 입력 데이터입니다." });
  }

  try {
    const newComment = await Comment.create({
      userId: userId,
      commentText: commentText,
      feedId: feedId,
    });

    res.status(200).json({
      success: true,
      message: "댓글이 작성되었습니다.",
      comment: newComment,
    });
  } catch (err) {
    console.error("댓글 저장 중 오류 발생:", err);
    res
      .status(500)
      .json({ success: false, message: "댓글 저장에 실패했습니다." });
  }
};

exports.get_Calender = async (req, res) => {
  const userId = req.session.userId;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).getDay();

  const { titles, description, state, todoid } = await get_today_todoList(
    req.session.userId
  );
  // 사용자 정보
  const userData = await User.findOne({
    where: {
      id: userId,
    },
  });
  let profileImg;
  if (userData.profile_image) {
    profileImg = userData.profile_image;
  } else {
    profileImg = "/static/img/profile.png";
  }

  res.render("calender", {
    year: year,
    month: month,
    lastDay: lastDay,
    firstDayOfMonth: firstDayOfMonth,
    dayNames: dayNames,
    titles: titles,
    description: description,
    state: state,
    todoid: todoid,
    profileImg: profileImg,
  });
};
exports.get_Timer = async (req, res) => {
  const userId = req.session.userId;
  const { titles, description, state, todoid } = await get_today_todoList(
    req.session.userId
  );
  // 사용자 정보
  const userData = await User.findOne({
    where: {
      id: userId,
    },
  });
  let profileImg;
  if (userData.profile_image) {
    profileImg = userData.profile_image;
  } else {
    profileImg = "/static/img/profile.png";
  }

  res.render("timer", {
    titles: titles,
    description: description,
    state: state,
    todoid: todoid,
    profileImg: profileImg,
  });
};

exports.get_changeDate = async (req, res) => {
  const { year, month, day } = req.query;

  const user_id = req.session.userId;

  // 클릭 연 월 일 필요
  const startOfDay = new Date(year, month, day);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(year, month, day);
  endOfDay.setHours(23, 59, 59, 999);

  const todos = await Task.findAll({
    where: {
      user_id: user_id,
      due_date: {
        [Op.gte]: startOfDay, // 시작일 이후
        [Op.lte]: endOfDay, // 종료일 이전
      },
    },
  });
  const titles = [];
  const description = [];
  const state = [];
  const todoid = [];

  todos.map((todo) => {
    titles.push(todo.title);
    description.push(todo.description);
    state.push(todo.state);
    todoid.push(todo.id);
  });

  // res.json({
  //   year: year,
  //   month: month,
  //   titles: titles,
  //   description: description,
  //   state: state,
  // });
  res.render("./shared/rotateTodoItem", {
    titles: titles,
    description: description,
    state: state,
    todoid: todoid,
  });
};

exports.get_Calender_currentData = (req, res) => {
  try {
    const today = new Date();
    let month = req.params.currentMonth;
    let year = req.params.currentYear;

    const lastDay = new Date(year, month, 0).getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

    res.json({
      month: month,
      lastDay: lastDay,
      firstDayOfMonth: firstDayOfMonth,
      dayNames: dayNames,
    });
  } catch (error) {
    console.error(error);
  }
};
exports.delete_todo = async (req, res) => {
  try {
    const user_id = req.session.userId;
    const { dataId } = req.body;
    await Task.destroy({
      where: {
        user_id: user_id,
        id: dataId,
      },
    });
    res.status(200).json({ delete: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ delete: false });
  }
};

exports.modify_todo = async (req, res) => {
  try {
    const { title, description, dataId } = req.body;
    await Task.update(
      { title: title, description: description },
      { where: { id: dataId } }
    );
    res.status(200).send("성공적으로 수정되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("수정 중 오류가 발생했습니다.");
  }
};

exports.status_todo = async (req, res) => {
  try {
    const { status, id } = req.body;
    await Task.update({ state: status }, { where: { id: id } });
    res.status(200).send("성공적으로 수정되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("상태 업데이트 중 오류가 발생했습니다.");
  }
};

exports.post_addtodo = async (req, res) => {
  try {
    const { title, description, year, month, today } = req.body;
    const specificDate = new Date(year, month - 1, today);
    const user_id = req.session.userId;

    const newtask = await Task.create({
      user_id,
      title,
      description,
      due_date: specificDate,
    });

    res.status(201).json(newtask);
  } catch (error) {
    console.error(error);
  }
};

exports.get_MyPage = async (req, res) => {
  const userId = req.session.userId;
  const userNickName = req.session.nickname;
  // 완료한 업무 검색
  const done_data = await Task.findAll({
    where: {
      user_id: userId,
      state: "done",
    },
  });
  const done_titles = [];
  const done_descriptions = [];
  const done_due_date = [];
  done_data.forEach((item) => {
    done_titles.push(item.dataValues.title);
    done_descriptions.push(item.dataValues.description);
    const date = createDate(item.dataValues.due_date);
    done_due_date.push(date);
  });

  // 미흡한 업무 검색
  const ongoing_data = await Task.findAll({
    where: {
      user_id: userId,
      state: "ongoing",
    },
  });
  const ongoing_titles = [];
  const ongoing_descriptions = [];
  const ongoing_due_date = [];
  ongoing_data.forEach((item) => {
    ongoing_titles.push(item.dataValues.title);
    ongoing_descriptions.push(item.dataValues.description);
    const date = createDate(item.dataValues.due_date);
    ongoing_due_date.push(date);
  });
  //미완료 업무 검색
  const pending_data = await Task.findAll({
    where: {
      user_id: userId,
      state: "pending",
    },
  });
  const pending_titles = [];
  const pending_descriptions = [];
  pending_data.forEach((item) => {
    pending_titles.push(item.dataValues.title);
    pending_descriptions.push(item.dataValues.description);
  });

  // 모든 업무의 개수
  const allListNum =
    done_titles.length + ongoing_titles.length + pending_titles.length;

  // 업무 성공률
  let successPercentage = Math.round((done_titles.length / allListNum) * 100);
  if (isNaN(successPercentage)) {
    successPercentage = 0;
  }
  // 사용자 정보
  const userData = await User.findOne({
    where: {
      id: userId,
    },
  });

  let profileImg;
  if (userData.profile_image) {
    profileImg = userData.profile_image;
  } else {
    profileImg = "/static/img/profile.png";
  }
  const likeData = await Like.findAll({
    where: {
      user_id: userId,
    },
  });
  const like_feedId_arr = [];
  likeData.forEach((like) => {
    like_feedId_arr.push(like.dataValues.feed_id);
  });
  //내가 올린 피드 검색용
  const feeds = await Feed.findAll({});

  //좋아요 누른 피드 검색
  const page = parseInt(req.query.page);
  const limit = 3; // 한페이지에 보여줄 피드 개수
  let offset = (page - 1) * limit;
  offset = isNaN(offset) ? 0 : offset;
  const like_feed = await Feed.findAll({
    where: {
      id: {
        [Op.in]: like_feedId_arr,
      },
    },
    include: [
      {
        model: require("../models/index").User,
        attributes: ["nickname"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: limit,
    offset: offset,
  });
  res.render("myPage", {
    done_titles: done_titles,
    done_descriptions: done_descriptions,
    ongoing_titles: ongoing_titles,
    ongoing_descriptions: ongoing_descriptions,
    pending_titles: pending_titles,
    pending_descriptions: pending_descriptions,
    done_due_date: done_due_date,
    ongoing_due_date: ongoing_due_date,
    allListNum: allListNum,
    successPercentage: successPercentage,
    nickname: userData.nickname,
    username: userData.username,
    profileImg: profileImg,
    likenum: like_feedId_arr.length,
    feeds: like_feed,
    userNickName: userNickName,
  });
};
function createDate(date) {
  // 날짜 객체 생성
  const dates = new Date(date);

  // 연도 추출
  const year = dates.getFullYear();

  // 월 추출 (0부터 시작하므로 1을 더해줌)
  const month = dates.getMonth() + 1;

  const getDate = dates.getDate();

  // 요일 추출
  const weekdays = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const weekday = weekdays[dates.getDay()];

  // 출력
  return `${year}년 ${month}월 ${getDate}일 ${weekday}`;
}

exports.post_ProfileImage = async (req, res) => {
  try {
    const bucketName = "pomodor-profile-image";
    const keyName = req.file.filename;
    // S3에 파일 업로드
    const fileUrl = await uploadToS3(req.file.path, bucketName, keyName);

    // 세션에서 사용자 ID 가져오기
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "로그인 해 주세요" });
    }

    // 사용자 정보 가져오기
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 프로필 이미지 URL 업데이트
    user.profile_image = fileUrl;
    await user.save(); // 변경 사항 저장

    return res.status(200).json({
      fileUrl: fileUrl,
      success: true,
      message: "프로필 이미지가 업데이트 되었습니다.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "프로필 이미지 업데이트에 실패",
      error: error.message,
    });
  }
};

exports.getComponent = (req, res) => {
  const { title, description, dataId, state } = req.query;
  res.render("./shared/rotateTodoItem", {
    titles: title,
    description: description,
    todoid: dataId,
    state: state,
  });
};
// 타이머, 캘린더에서 표시할 오늘 일정 불러오는 함수(접어두고 사용)
async function get_today_todoList(userId) {
  const user_id = userId;

  // 오늘 0시부터 24시까지의 범위와 아이디로 일정을 탐색
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todos = await Task.findAll({
    where: {
      user_id: user_id,
      due_date: {
        [Op.gte]: startOfDay, // 시작일 이후
        [Op.lte]: endOfDay, // 종료일 이전
      },
    },
  });

  const titles = [];
  const description = [];
  const state = [];
  const todoid = [];

  todos.map((todo) => {
    titles.push(todo.title);
    description.push(todo.description);
    state.push(todo.state);
    todoid.push(todo.id);
  });
  return {
    titles,
    description,
    state,
    todoid,
  };
}
