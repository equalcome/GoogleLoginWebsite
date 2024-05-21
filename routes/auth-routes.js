const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度過短，至少需要8個數字or英文字。");
    return res.redirect("/auth/signup");
  }

  //確認信箱是否被註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "信箱已經被註冊。請使用另一個信箱，或是嘗試使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }

  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "水啦，註冊成功了，現在可以登入了歐");
  return res.redirect("/auth/login");
});
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/profile");
});

module.exports = router;
