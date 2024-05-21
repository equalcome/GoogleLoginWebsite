const router = require("express").Router();

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.render("/auth.login");
  }
};

router.get("/", authCheck, (req, res) => {
  return res.render("profile", { user: req.user }); //deSerializeUser()
});

module.exports = router;
