const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

/*  **********************************
 *  Inquiry Submission Validation Rules
 * ********************************* */
validate.inquiryRules = () => {
  return [
    // vehicle_id is required
    body("vehicle_id")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Vehicle ID is required."),

    // inquiry_subject is required and must be at least 5 characters
    body("inquiry_subject")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 5, max: 255 })
      .withMessage("Subject must be between 5 and 255 characters."),

    // inquiry_message is required and must be at least 10 characters
    body("inquiry_message")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Message must be between 10 and 2000 characters."),
  ]
}

/* ******************************
 * Check inquiry data and return errors or continue
 * ***************************** */
validate.checkInquiryData = async (req, res, next) => {
  const { vehicle_id, inquiry_subject, inquiry_message } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const invModel = require("../models/inventory-model")
    const vehicleData = await invModel.getInventoryById(vehicle_id)
    const vehicleName = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
    
    res.render("inquiry/inquiry-form", {
      errors,
      title: `Inquiry - ${vehicleName}`,
      nav,
      vehicleData,
      vehicleName,
      inquiry_subject,
      inquiry_message,
    })
    return
  }
  next()
}

/*  **********************************
 *  Response Validation Rules
 * ********************************* */
validate.responseRules = () => {
  return [
    // inquiry_id is required
    body("inquiry_id")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Inquiry ID is required."),

    // response_message is required and must be at least 10 characters
    body("response_message")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Response must be between 10 and 2000 characters."),
  ]
}

/* ******************************
 * Check response data and return errors or continue
 * ***************************** */
validate.checkResponseData = async (req, res, next) => {
  const { inquiry_id, response_message } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const inquiryModel = require("../models/inquiry-model")
    const inquiry = await inquiryModel.getInquiryById(inquiry_id)
    
    res.render("inquiry/respond-inquiry", {
      errors,
      title: "Respond to Inquiry",
      nav,
      inquiry,
      response_message,
    })
    return
  }
  next()
}

module.exports = validate