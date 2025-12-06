const inquiryModel = require("../models/inquiry-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const inquiryCont = {}

/* ***************************
 *  Build inquiry form view
 * ************************** */
inquiryCont.buildInquiryForm = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const vehicleData = await invModel.getInventoryById(inv_id)
  
  if (!vehicleData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/")
  }
  
  const vehicleName = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
  
  res.render("inquiry/inquiry-form", {
    title: `Inquiry - ${vehicleName}`,
    nav,
    vehicleData,
    vehicleName,
    errors: null,
  })
}

/* ***************************
 *  Process inquiry submission
 * ************************** */
inquiryCont.submitInquiry = async function (req, res) {
  let nav = await utilities.getNav()
  const { vehicle_id, inquiry_subject, inquiry_message } = req.body
  const account_id = res.locals.accountData.account_id
  
  console.log("Submitting inquiry:", { vehicle_id, account_id, inquiry_subject })
  
  // Get vehicle data for re-rendering if needed
  const vehicleData = await invModel.getInventoryById(vehicle_id)
  const vehicleName = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`

  const inquiryResult = await inquiryModel.createInquiry(
    vehicle_id,
    account_id,
    inquiry_subject,
    inquiry_message
  )

  console.log("Inquiry result:", inquiryResult)

  if (inquiryResult) {
    req.flash(
      "notice",
      "Your inquiry has been submitted successfully. We will respond as soon as possible."
    )
    res.redirect("/inquiry/my-inquiries")
  } else {
    req.flash("notice", "Sorry, there was an error submitting your inquiry.")
    res.status(501).render("inquiry/inquiry-form", {
      title: `Inquiry - ${vehicleName}`,
      nav,
      vehicleData,
      vehicleName,
      errors: null,
      inquiry_subject,
      inquiry_message,
    })
  }
}

/* ***************************
 *  Build customer's inquiries view
 * ************************** */
inquiryCont.buildMyInquiries = async function (req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const inquiries = await inquiryModel.getInquiriesByAccountId(account_id)
  
  res.render("inquiry/my-inquiries", {
    title: "My Inquiries",
    nav,
    inquiries,
    errors: null,
  })
}

/* ***************************
 *  Build inquiry detail view (customer)
 * ************************** */
inquiryCont.buildInquiryDetail = async function (req, res, next) {
  const inquiry_id = parseInt(req.params.inquiry_id)
  let nav = await utilities.getNav()
  const inquiry = await inquiryModel.getInquiryById(inquiry_id)
  
  if (!inquiry) {
    req.flash("notice", "Inquiry not found.")
    return res.redirect("/inquiry/my-inquiries")
  }
  
  // Check if the inquiry belongs to the logged-in user
  if (inquiry.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to view this inquiry.")
    return res.redirect("/inquiry/my-inquiries")
  }
  
  res.render("inquiry/inquiry-detail", {
    title: "Inquiry Details",
    nav,
    inquiry,
    errors: null,
  })
}

/* ***************************
 *  Build employee inbox view
 * ************************** */
inquiryCont.buildEmployeeInbox = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inquiries = await inquiryModel.getAllInquiries()
  
  console.log("Total inquiries found:", inquiries.length)
  if (inquiries.length > 0) {
    console.log("First inquiry status:", inquiries[0].inquiry_status)
    console.log("First inquiry:", inquiries[0])
  }
  
  // Separate inquiries by status for better organization
  const pendingInquiries = inquiries.filter(i => i.inquiry_status === 'Pending')
  const respondedInquiries = inquiries.filter(i => i.inquiry_status === 'Resolved' || i.inquiry_status === 'In Progress')
  const closedInquiries = inquiries.filter(i => i.inquiry_status === 'Closed')
  
  console.log("Pending:", pendingInquiries.length)
  console.log("Responded:", respondedInquiries.length)
  console.log("Closed:", closedInquiries.length)
  
  res.render("inquiry/employee-inbox", {
    title: "Customer Inquiries",
    nav,
    pendingInquiries,
    respondedInquiries,
    closedInquiries,
    allInquiries: inquiries,
    errors: null,
  })
}

/* ***************************
 *  Build respond to inquiry view
 * ************************** */
inquiryCont.buildRespondView = async function (req, res, next) {
  const inquiry_id = parseInt(req.params.inquiry_id)
  let nav = await utilities.getNav()
  const inquiry = await inquiryModel.getInquiryById(inquiry_id)
  
  if (!inquiry) {
    req.flash("notice", "Inquiry not found.")
    return res.redirect("/inquiry/inbox")
  }
  
  res.render("inquiry/respond-inquiry", {
    title: "Respond to Inquiry",
    nav,
    inquiry,
    errors: null,
  })
}

/* ***************************
 *  Process inquiry response
 * ************************** */
inquiryCont.processResponse = async function (req, res) {
  let nav = await utilities.getNav()
  const { inquiry_id, response_message } = req.body
  const responded_by = res.locals.accountData.account_id
  
  const inquiry = await inquiryModel.getInquiryById(inquiry_id)
  
  const responseResult = await inquiryModel.respondToInquiry(
    inquiry_id,
    response_message,
    responded_by
  )

  if (responseResult) {
    req.flash("notice", "Response sent successfully.")
    res.redirect("/inquiry/inbox")
  } else {
    req.flash("notice", "Sorry, there was an error sending the response.")
    res.status(501).render("inquiry/respond-inquiry", {
      title: "Respond to Inquiry",
      nav,
      inquiry,
      errors: null,
      response_message,
    })
  }
}

/* ***************************
 *  Update inquiry status
 * ************************** */
inquiryCont.updateStatus = async function (req, res) {
  const { inquiry_id, status } = req.body
  
  const updateResult = await inquiryModel.updateInquiryStatus(inquiry_id, status)

  if (updateResult) {
    req.flash("notice", `Inquiry status updated to ${status}.`)
  } else {
    req.flash("notice", "Sorry, there was an error updating the status.")
  }
  
  res.redirect("/inquiry/inbox")
}

/* ***************************
 *  Delete inquiry
 * ************************** */
inquiryCont.deleteInquiry = async function (req, res) {
  const inquiry_id = parseInt(req.body.inquiry_id)
  
  const deleteResult = await inquiryModel.deleteInquiry(inquiry_id)

  if (deleteResult) {
    req.flash("notice", "Inquiry deleted successfully.")
  } else {
    req.flash("notice", "Sorry, there was an error deleting the inquiry.")
  }
  
  res.redirect("/inquiry/inbox")
}

module.exports = inquiryCont