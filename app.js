const express = require("express");
const session = require("express-session");
const { sequelize } = require("./models");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const sessionConfig = {
  secret: "mySecretSession",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  },
};
app.use(session(sessionConfig));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use("/static", express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// res.local로 모든 템플릿에서 session값 받기
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.nickname = req.session.nickname;
  next();
});
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

app.get("*", (req, res) => {
  res.render("404");
});

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });

// Login

app.post("/login", (req, res) => {
  const { userId, userPw } = req.body;
});
