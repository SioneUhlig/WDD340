// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inquiryController = require("../controllers/inquiryController")
const utilities = require("../utilities/")
const inquiryValidate = require("../utilities/inquiry-validation")

// Route to build inquiry form (PROTECTED - must be logged in)
router.get("/vehicle/:inv_id", 
  utilities.checkLogin, 
  utilities.handleErrors(inquiryController.buildInquiryForm)
);

// Route to process inquiry submission (PROTECTED - must be logged in)
router.post(
  "/submit",
  utilities.checkLogin,
  inquiryValidate.inquiryRules(),
  inquiryValidate.checkInquiryData,
  utilities.handleErrors(inquiryController.submitInquiry)
);

// Route to view customer's own inquiries (PROTECTED - must be logged in)
router.get("/my-inquiries", 
  utilities.checkLogin, 
  utilities.handleErrors(inquiryController.buildMyInquiries)
);

// Route to view specific inquiry detail (PROTECTED - must be logged in)
router.get("/detail/:inquiry_id", 
  utilities.checkLogin, 
  utilities.handleErrors(inquiryController.buildInquiryDetail)
);

// Route to build employee inbox (PROTECTED - Employee/Admin only)
router.get("/inbox", 
  utilities.checkAccountType, 
  utilities.handleErrors(inquiryController.buildEmployeeInbox)
);

// Route to build respond view (PROTECTED - Employee/Admin only)
router.get("/respond/:inquiry_id", 
  utilities.checkAccountType, 
  utilities.handleErrors(inquiryController.buildRespondView)
);

// Route to process response (PROTECTED - Employee/Admin only)
router.post(
  "/respond",
  utilities.checkAccountType,
  inquiryValidate.responseRules(),
  inquiryValidate.checkResponseData,
  utilities.handleErrors(inquiryController.processResponse)
);

// Route to update inquiry status (PROTECTED - Employee/Admin only)
router.post(
  "/update-status",
  utilities.checkAccountType,
  utilities.handleErrors(inquiryController.updateStatus)
);

// Route to delete inquiry (PROTECTED - Employee/Admin only)
router.post(
  "/delete",
  utilities.checkAccountType,
  utilities.handleErrors(inquiryController.deleteInquiry)
);

module.exports = router;