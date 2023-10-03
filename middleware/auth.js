// ========================================================
const Product = require("../controller/adminController");
const User = require('../model/user')
// ========================================================
const notlogged = (req, res, next) => {
  try {
    if (!req.session.admin) {
      next();
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ========================================================
const loggedIn = (req, res, next) => {
  try {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ========================================================

const isBlocked = async (req, res, next) => {
  const email = req.session.user
  try {
    const user = await User.findOne({email:email});

    if (!user.block) {
      next();
    } else {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        // const msg ="Admin Blocked You"
        // req.session.message = msg
        res.redirect("/login");
      });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).send('Error checking user.');
  }
};

// ==========================================================
//////////////////////ADMIN//////////////////////////////////
const isLoggedIn = async (req, res, next) => {
  const email = req.session.user
  const user = await User.findOne({email:email})
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};
// ==========================================================


module.exports = {
  loggedIn,
  notlogged,
  isBlocked,
  isLoggedIn
};
// ========================================================
