// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management route - protected by checkLogin middleware
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Route to build account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

// Route to process account update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Route to process password change
router.post(
  "/change-password",
  utilities.checkLogin,
  regValidate.passwordChangeRules(),
  regValidate.checkPasswordChange,
  utilities.handleErrors(accountController.changePassword)
);

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;