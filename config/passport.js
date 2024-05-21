const passport = require("passport");
const GoogleStratrgy = require("passport-google-oauth20");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
  console.log("Serialize使用者");
  done(null, user._id); // 將mondoDB的id，存在session內部
  //並且將id簽名後，以cookie的形式給使用者。。。
});

passport.deserializeUser(async (_id, done) => {
  console.log(
    "deserializeUser使用者......使用serializeUser儲存的id，去找到資料庫內的資料"
  );
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); //將req.user這個屬性設定為foundUser
});

passport.use(
  new GoogleStratrgy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入Google Strategy的區域");
      // console.log(profile);
      // console.log("============================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已經註冊過了，無須存入資料庫內。");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶，須將資料存入資料庫內。");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功創建新用戶。");
        done(null, savedUser);
      }
    }
  )
);
