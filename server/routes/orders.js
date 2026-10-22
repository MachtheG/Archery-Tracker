const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');

router.post('/checkout', async (req, res) => {
  try {
    const { items, buyer, sellers } = req.body;
    
    if (!items || !buyer || !sellers) {
      return res.status(400).json({ message: 'Missing required checkout information' });
    }

    // 1. Send confirmation email to the buyer
    const buyerItemsHtml = items.map(i => `<li>${i.name} - KSh ${i.price} (Qty: ${i.quantity})</li>`).join('');
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    await sendEmail({
      to: buyer.email,
      subject: 'Archery Tracker - Order Confirmation',
      html: `
        <h2>Order Confirmed!</h2>
        <p>Hi ${buyer.name},</p>
        <p>Your order has been successfully placed. The sellers have been notified and will contact you shortly.</p>
        <h3>Order Summary</h3>
        <ul>${buyerItemsHtml}</ul>
        <p><strong>Total: KSh ${total}</strong></p>
      `
    });

    // 2. Send notification emails to each seller
    for (const sellerEmail of Object.keys(sellers)) {
      const sellerInfo = sellers[sellerEmail];
      const sellerItemsHtml = sellerInfo.items.map(i => `<li>${i.name} - KSh ${i.price}</li>`).join('');
      
      await sendEmail({
        to: sellerEmail,
        subject: 'Archery Tracker - You have a new order!',
        html: `
          <h2>New Order Received</h2>
          <p>Hi ${sellerInfo.sellerName},</p>
          <p>Great news! Someone has purchased your item(s) on the Archery Tracker marketplace.</p>
          <h3>Buyer Details</h3>
          <p><strong>Name:</strong> ${buyer.name}</p>
          <p><strong>Email:</strong> ${buyer.email}</p>
          ${buyer.phone ? `<p><strong>Phone:</strong> ${buyer.phone}</p>` : ''}
          ${buyer.notes ? `<p><strong>Notes:</strong> ${buyer.notes}</p>` : ''}
          
          <h3>Items Sold</h3>
          <ul>${sellerItemsHtml}</ul>
          
          <p>Please contact the buyer directly to arrange payment and delivery.</p>
        `
      });
    }

    res.status(200).json({ message: 'Checkout successful, emails sent.' });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Failed to process checkout' });
  }
});

module.exports = router;
