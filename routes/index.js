const express = require("express");
const router = express.Router();
const controller = require("../controller/Cmain");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // 업로드할 위치를 지정합니다.

router.get("/", controller.get_Index);

router.get("/get-feeds", controller.get_Feeds);

router.delete("/feeds/delete/:id", controller.del_FeedDelete);

router.post(
  "/feeds/update",
  upload.single("image"),
  controller.post_FeedUpdate
);

router.get("/login", controller.get_Login);

router.post("/login", controller.post_Login);

router.get("/login/register", controller.get_Register);

router.post("/login/register", controller.post_Register);

router.get("/login/find", controller.get_Find);

router.post("/login/find/email", controller.post_FindEmail);

router.post("/login/find/password", controller.post_ResetPassword);

router.post("/login/find/update", controller.update_Password);

// router.post("/register", controller.post_Register);

router.get("/feed", controller.get_Feed);

router.post("/feed/upload", controller.post_feedUpload);

router.post("feed/comment", controller.post_Comment);

router.get("/calender", controller.get_Calender);

router.get(
  "/calender/:currentMonth/:currentYear",
  controller.get_Calender_currentData
);

router.get("/get-like-status", controller.get_LikeStatus);

router.post("/toggle-like", controller.toggleLike);

router.get("/api/likes/:feedId", controller.get_likesUsers);

router.get("/get-like-count", controller.get_likeCount);

router.get("/get-feed-like", controller.get_feedlike);

router.post("/calender/addTodo", controller.post_addtodo);

router.get("/calender/changeDate", controller.get_changeDate);

router.delete("/calender/delete", controller.delete_todo);

router.patch("/calender/modify", controller.modify_todo);

router.patch("/calender/status", controller.status_todo);

router.get("/timer", controller.get_Timer);

router.get("/myPage", controller.get_MyPage);

router.post(
  "/myPage/profileImage",
  upload.single("profile_image"),
  controller.post_ProfileImage
);

router.get("/loading", (req, res) => {
  res.render("loading");
});

router.get("/get-component", controller.getComponent);

module.exports = router;
