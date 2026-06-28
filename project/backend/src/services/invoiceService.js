/**
 * Generates printable HTML Invoice for orders
 * @param {object} order
 */
export const generateHtmlInvoice = (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid rgba(238, 16, 16, 0.1); color: #c9c9c9;">
        <strong>${item.product.title}</strong><br>
        <span style="font-size: 11px; color: #999;">Anime: ${item.product.animeName} | Finish: ${item.finishType}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(238, 16, 16, 0.1); text-align: center; color: #c9c9c9;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(238, 16, 16, 0.1); text-align: center; color: #c9c9c9;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(238, 16, 16, 0.1); text-align: right; color: #c9c9c9;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${order._id}</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          background-color: #1a1a18;
          color: #c9c9c9;
          margin: 0;
          padding: 20px;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ee1010;
          box-shadow: 0 0 15px rgba(238, 16, 16, 0.2);
          background-color: #0d0d0c;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #ee1010;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #ee1010;
          letter-spacing: 2px;
        }
        .meta-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .address-box {
          width: 48%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #ee1010;
          color: #white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        .totals-box {
          float: right;
          width: 300px;
          margin-bottom: 20px;
        }
        .totals-box table tr td {
          padding: 5px 0;
        }
        .footer {
          clear: both;
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px dashed rgba(238, 16, 16, 0.4);
          font-size: 12px;
          color: #777;
        }
        @media print {
          body {
            background-color: #fff;
            color: #000;
          }
          .invoice-box {
            border: none;
            box-shadow: none;
            background-color: #fff;
          }
          th {
            background-color: #000;
            color: #fff;
          }
          td {
            color: #000 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="title">ANIMYSAKU STORE</div>
            <div style="font-size: 12px; margin-top: 5px;">Cyberpunk Anime Poster & Sticker Hub</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: bold; color: #ee1010;">INVOICE</div>
            <div style="font-size: 12px; margin-top: 5px;">ID: #${order._id.toString().toUpperCase()}</div>
            <div style="font-size: 12px;">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta-details">
          <div class="address-box">
            <h3 style="color: #ee1010; border-bottom: 1px solid rgba(238, 16, 16, 0.2); padding-bottom: 5px; margin-top:0;">BILLED TO:</h3>
            <strong>Name:</strong> ${order.user.name}<br>
            <strong>Email:</strong> ${order.user.email}
          </div>
          <div class="address-box" style="text-align: right;">
            <h3 style="color: #ee1010; border-bottom: 1px solid rgba(238, 16, 16, 0.2); padding-bottom: 5px; margin-top:0; text-align: right;">SHIPPED TO:</h3>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
            <strong>Phone:</strong> ${order.shippingAddress.phoneNumber}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="color: white;">PRODUCT</th>
              <th style="text-align: center; color: white;">PRICE</th>
              <th style="text-align: center; color: white;">QTY</th>
              <th style="text-align: right; color: white;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-box">
          <table style="margin-bottom:0;">
            <tr>
              <td style="color: #999;">Subtotal:</td>
              <td style="text-align: right; font-weight: bold;">₹${order.totals.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #999;">Shipping:</td>
              <td style="text-align: right; font-weight: bold;">₹${order.totals.shipping.toFixed(2)}</td>
            </tr>
            ${
              order.totals.couponDiscount > 0
                ? `
            <tr>
              <td style="color: #ee1010;">Discount:</td>
              <td style="text-align: right; font-weight: bold; color: #ee1010;">-₹${order.totals.couponDiscount.toFixed(2)}</td>
            </tr>
            `
                : ''
            }
            <tr style="border-top: 1.5px solid #ee1010;">
              <td style="font-weight: bold; font-size: 16px; color: #ee1010; padding-top: 10px;">Grand Total:</td>
              <td style="text-align: right; font-weight: bold; font-size: 16px; color: #ee1010; padding-top: 10px;">₹${order.totals.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="clear: both; margin-top: 40px; padding: 15px; border: 1px solid rgba(238, 16, 16, 0.2); border-radius: 5px; font-size: 12px; background-color: rgba(238, 16, 16, 0.02);">
          <strong>Payment Info:</strong><br>
          Method: ${order.paymentInfo.method} | Status: ${order.paymentInfo.status.toUpperCase()}<br>
          ${order.paymentInfo.razorpayOrderId ? `Razorpay Order: ${order.paymentInfo.razorpayOrderId}` : ''}
        </div>

        <div class="footer">
          Thank you for shopping at AnimySaku Store!<br>
          Join the Otaku community and tag us in your room setups.<br>
          For queries, reach out at support@animysaku.com
        </div>
      </div>
    </body>
    </html>
  `;
};
