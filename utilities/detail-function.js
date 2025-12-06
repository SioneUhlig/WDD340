/* **************************************
* Build the vehicle detail view HTML (updated with inquiry button)
* ************************************ */
Util.buildDetailView = async function(vehicle){
  let detailHTML = '<div class="vehicle-detail">'
  
  // Left side - Image
  detailHTML += '<div class="vehicle-image">'
  detailHTML += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">`
  detailHTML += '</div>'
  
  // Right side - Details box
  detailHTML += '<div class="vehicle-details-box">'
  detailHTML += `<h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>`
  
  detailHTML += `<p class="detail-item"><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`
  
  detailHTML += `<p class="detail-item"><strong>Description:</strong> ${vehicle.inv_description}</p>`
  
  detailHTML += `<p class="detail-item"><strong>Color:</strong> ${vehicle.inv_color}</p>`
  
  detailHTML += `<p class="detail-item"><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p>`
  
  // Add inquiry button
  detailHTML += '<div class="vehicle-actions" style="margin-top: 20px;">'
  detailHTML += `<a href="/inquiry/vehicle/${vehicle.inv_id}" class="inquiry-btn" style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; transition: background-color 0.3s ease;">Inquire About This Vehicle</a>`
  detailHTML += '</div>'
  
  detailHTML += '</div>'
  detailHTML += '</div>'
  
  return detailHTML
}