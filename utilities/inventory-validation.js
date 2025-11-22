const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // classification_name is required and must not contain spaces or special characters
    body("classification_name")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
 *  Inventory Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    // classification_id is required
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),

    // inv_make is required
    body("inv_make")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make is required and must be at least 3 characters."),

    // inv_model is required
    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Model is required and must be at least 3 characters."),

    // inv_year is required and must be 4 digits
    body("inv_year")
      .trim()
      .notEmpty()
      .matches(/^\d{4}$/)
      .withMessage("Year must be a 4-digit number."),

    // inv_description is required
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    // inv_image is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    // inv_thumbnail is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    // inv_price is required and must be a positive number
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // inv_miles is required and must be a positive integer
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),

    // inv_color is required
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, 
          inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

module.exports = validate