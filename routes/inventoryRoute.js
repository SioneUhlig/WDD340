// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view (PUBLIC - no auth required)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view (PUBLIC - no auth required)
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build management view (PROTECTED - Employee/Admin only)
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

// Route to build add classification view (PROTECTED - Employee/Admin only)
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Route to process add classification (PROTECTED - Employee/Admin only)
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view (PROTECTED - Employee/Admin only)
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Route to process add inventory (PROTECTED - Employee/Admin only)
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to get inventory by classification_id (JSON) - used by management view
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view (PROTECTED - Employee/Admin only)
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));

// Route to process inventory update (PROTECTED - Employee/Admin only)
router.post(
  "/update/",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build delete confirmation view (PROTECTED - Employee/Admin only)
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

// Route to process inventory deletion (PROTECTED - Employee/Admin only)
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

module.exports = router;