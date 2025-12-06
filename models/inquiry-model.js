const pool = require("../database/")
/* *****************************
*   Create new inquiry
* *************************** */
async function createInquiry(vehicle_id, account_id, inquiry_subject, inquiry_message) {
  try {
    console.log("=== CREATE INQUIRY DEBUG ===")
    console.log("Params:", { vehicle_id, account_id, inquiry_subject, inquiry_message })
    
    const sql = `INSERT INTO inquiries 
      (vehicle_id, account_id, inquiry_subject, inquiry_message, inquiry_status, inquiry_date) 
      VALUES ($1, $2, $3, $4, 'Pending', CURRENT_TIMESTAMP) 
      RETURNING *`
    
    console.log("SQL:", sql)
    const result = await pool.query(sql, [vehicle_id, account_id, inquiry_subject, inquiry_message])
    console.log("Insert result:", result.rows)
    return result
  } catch (error) {
    console.error("CREATE INQUIRY ERROR:", error)
    return error.message
  }
}


/* *****************************
*   Get all inquiries (for employees)
* *************************** */
async function getAllInquiries() {
  try {
    console.log("=== GET ALL INQUIRIES DEBUG ===")
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
    
    console.log("Executing getAllInquiries query...")
    const result = await pool.query(sql)
    console.log("Query result rows:", result.rows.length)
    if (result.rows.length > 0) {
      console.log("First inquiry:", result.rows[0])
    }
    return result.rows
  } catch (error) {
    console.error("GET ALL INQUIRIES ERROR:", error.message)
    console.error("Full error:", error)
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
    console.log("=== RESPOND TO INQUIRY DEBUG ===")
    console.log("Params:", { inquiry_id, response_message, responded_by })
    
    const sql = `UPDATE inquiries 
      SET response_message = $1, 
          response_date = CURRENT_TIMESTAMP, 
          responded_by = $2,
          inquiry_status = 'Resolved'
      WHERE inquiry_id = $3 
      RETURNING *`
    
    console.log("Executing respond query...")
    const result = await pool.query(sql, [response_message, responded_by, inquiry_id])
    console.log("Response result:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("RESPOND TO INQUIRY ERROR:", error.message)
    console.error("Full error:", error)
    return null
  }
}
/* *****************************
*   Update inquiry status
* *************************** */
async function updateInquiryStatus(inquiry_id, status) {
  try {
    console.log("=== UPDATE INQUIRY STATUS DEBUG ===")
    console.log("Params:", { inquiry_id, status })
    
    // Capitalize the first letter to match the ENUM
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1)
    
    console.log("Capitalized status:", capitalizedStatus)
    
    const sql = `UPDATE inquiries 
      SET inquiry_status = $1
      WHERE inquiry_id = $2 
      RETURNING *`
    
    const result = await pool.query(sql, [capitalizedStatus, inquiry_id])
    console.log("Update status result:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("UPDATE INQUIRY STATUS ERROR:", error.message)
    console.error("Full error:", error)
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
      WHERE inquiry_status = 'pending'`
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