const pool = require("../database/")

/* *****************************
*   Create new inquiry
* *************************** */
async function createInquiry(vehicle_id, account_id, inquiry_subject, inquiry_message) {
  try {
    const sql = `INSERT INTO inquiries 
      (vehicle_id, account_id, inquiry_subject, inquiry_message, inquiry_status, inquiry_date) 
      VALUES ($1, $2, $3, $4, 'Pending', CURRENT_TIMESTAMP) 
      RETURNING *`
    return await pool.query(sql, [vehicle_id, account_id, inquiry_subject, inquiry_message])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Get all inquiries (for employees)
* *************************** */
async function getAllInquiries() {
  try {
    const sql = `SELECT 
      i.inquiry_id,
      i.vehicle_id,
      i.account_id,
      i.inquiry_subject,
      i.inquiry_message,
      i.inquiry_status,
      i.inquiry_date,
      i.response_message,
      i.response_date,
      i.responded_by,
      a.account_firstname,
      a.account_lastname,
      a.account_email,
      inv.inv_make,
      inv.inv_model,
      inv.inv_year,
      responder.account_firstname as responder_firstname,
      responder.account_lastname as responder_lastname
      FROM inquiries i
      JOIN account a ON i.account_id = a.account_id
      JOIN inventory inv ON i.vehicle_id = inv.inv_id
      LEFT JOIN account responder ON i.responded_by = responder.account_id
      ORDER BY 
        CASE i.inquiry_status 
          WHEN 'Pending' THEN 1 
          WHEN 'In Progress' THEN 2
          WHEN 'Resolved' THEN 3
          WHEN 'Closed' THEN 4
        END,
        i.inquiry_date DESC`
    const result = await pool.query(sql)
    return result.rows
  } catch (error) {
    console.error("getAllInquiries error: " + error)
    return []
  }
}

/* *****************************
*   Get inquiries by account_id (customer's own inquiries)
* *************************** */
async function getInquiriesByAccountId(account_id) {
  try {
    const sql = `SELECT 
      i.inquiry_id,
      i.vehicle_id,
      i.inquiry_subject,
      i.inquiry_message,
      i.inquiry_status,
      i.inquiry_date,
      i.response_message,
      i.response_date,
      inv.inv_make,
      inv.inv_model,
      inv.inv_year,
      inv.inv_image,
      responder.account_firstname as responder_firstname,
      responder.account_lastname as responder_lastname
      FROM inquiries i
      JOIN inventory inv ON i.vehicle_id = inv.inv_id
      LEFT JOIN account responder ON i.responded_by = responder.account_id
      WHERE i.account_id = $1
      ORDER BY i.inquiry_date DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getInquiriesByAccountId error: " + error)
    return []
  }
}

/* *****************************
*   Get inquiry by inquiry_id
* *************************** */
async function getInquiryById(inquiry_id) {
  try {
    const sql = `SELECT 
      i.inquiry_id,
      i.vehicle_id,
      i.account_id,
      i.inquiry_subject,
      i.inquiry_message,
      i.inquiry_status,
      i.inquiry_date,
      i.response_message,
      i.response_date,
      i.responded_by,
      a.account_firstname,
      a.account_lastname,
      a.account_email,
      inv.inv_make,
      inv.inv_model,
      inv.inv_year,
      inv.inv_price,
      inv.inv_image,
      responder.account_firstname as responder_firstname,
      responder.account_lastname as responder_lastname
      FROM inquiries i
      JOIN account a ON i.account_id = a.account_id
      JOIN inventory inv ON i.vehicle_id = inv.inv_id
      LEFT JOIN account responder ON i.responded_by = responder.account_id
      WHERE i.inquiry_id = $1`
    const result = await pool.query(sql, [inquiry_id])
    return result.rows[0]
  } catch (error) {
    console.error("getInquiryById error: " + error)
    return null
  }
}

/* *****************************
*   Update inquiry with response
* *************************** */
async function respondToInquiry(inquiry_id, response_message, responded_by) {
  try {
    const sql = `UPDATE inquiries 
      SET response_message = $1, 
          response_date = CURRENT_TIMESTAMP, 
          responded_by = $2,
          inquiry_status = 'Resolved'
      WHERE inquiry_id = $3 
      RETURNING *`
    const result = await pool.query(sql, [response_message, responded_by, inquiry_id])
    return result.rows[0]
  } catch (error) {
    console.error("respondToInquiry error: " + error)
    return null
  }
}

/* *****************************
*   Update inquiry status
* *************************** */
async function updateInquiryStatus(inquiry_id, status) {
  try {
    // Map any status to the correct ENUM value
    const statusMap = {
      'pending': 'Pending',
      'Pending': 'Pending',
      'in progress': 'In Progress',
      'In Progress': 'In Progress',
      'resolved': 'Resolved',
      'Resolved': 'Resolved',
      'responded': 'Resolved',
      'Responded': 'Resolved',
      'closed': 'Closed',
      'Closed': 'Closed'
    }
    
    const finalStatus = statusMap[status] || status
    
    const sql = `UPDATE inquiries 
      SET inquiry_status = $1::inquiry_status
      WHERE inquiry_id = $2 
      RETURNING *`
    const result = await pool.query(sql, [finalStatus, inquiry_id])
    return result.rows[0]
  } catch (error) {
    console.error("updateInquiryStatus error: " + error)
    return null
  }
}

/* *****************************
*   Get pending inquiries count
* *************************** */
async function getPendingInquiriesCount() {
  try {
    const sql = `SELECT COUNT(*) as count 
      FROM inquiries 
      WHERE inquiry_status = 'Pending'`
    const result = await pool.query(sql)
    return result.rows[0].count
  } catch (error) {
    console.error("getPendingInquiriesCount error: " + error)
    return 0
  }
}

/* *****************************
*   Delete inquiry
* *************************** */
async function deleteInquiry(inquiry_id) {
  try {
    const sql = 'DELETE FROM inquiries WHERE inquiry_id = $1'
    const result = await pool.query(sql, [inquiry_id])
    return result
  } catch (error) {
    console.error("deleteInquiry error: " + error)
    return null
  }
}

module.exports = {
  createInquiry,
  getAllInquiries,
  getInquiriesByAccountId,
  getInquiryById,
  respondToInquiry,
  updateInquiryStatus,
  getPendingInquiriesCount,
  deleteInquiry
}