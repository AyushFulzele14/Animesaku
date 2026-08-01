import { sendEmail } from './mailService.js';
import { logger } from '../config/logger.js';

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async (user, order) => {
  try {
    const itemsHTML = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">x${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ee1010;">Order Confirmed!</h1>
            <p>Hi ${user.name},</p>
            <p>Thank you for your order! Your order has been placed successfully.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentInfo.method}</p>
            </div>

            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold;">
              <p>Total: <span style="color: #ee1010;">₹${order.totals.grandTotal.toFixed(2)}</span></p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p>
                ${order.shippingAddress.street}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
                ${order.shippingAddress.country}
              </p>
            </div>

            <p>What happens next?</p>
            <ul>
              <li>Your order will be prepared and packed</li>
              <li>You'll receive a shipping confirmation with tracking number</li>
              <li>Your items will be shipped within 2-3 business days</li>
            </ul>

            <p>If you have any questions, feel free to contact us.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Order Confirmed! Order #${order._id.toString().slice(-8)}`,
      html,
      text: `Hi ${user.name},\n\nThank you for your order! Your order has been placed successfully. Order ID: ${order._id}. Total: ₹${order.totals.grandTotal.toFixed(2)}`,
    });
    logger.info(`Order confirmation email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send order confirmation email: ${error.message}`);
  }
};

/**
 * Send Shipping Notification Email
 */
export const sendShippingNotificationEmail = async (user, order, trackingNumber) => {
  try {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ee1010;">Your Order Has Shipped! 🚚</h1>
            <p>Hi ${user.name},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Tracking Information</h3>
              <p><strong>Tracking Number:</strong> <span style="font-family: monospace; font-weight: bold;">${trackingNumber}</span></p>
              <p><strong>Order ID:</strong> ${order._id.toString().slice(-8)}</p>
              <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Will be updated'}</p>
            </div>

            <p>You can track your package using the tracking number above on your carrier's website.</p>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Delivery Address</h3>
              <p>
                ${order.shippingAddress.street}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
                ${order.shippingAddress.country}
              </p>
            </div>

            <p>If you have any questions about your shipment, please don't hesitate to contact us.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Your Order Has Shipped! Tracking: ${trackingNumber}`,
      html,
      text: `Hi ${user.name},\n\nYour order has shipped! Tracking number is: ${trackingNumber}`,
    });
    logger.info(`Shipping notification email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send shipping notification email: ${error.message}`);
  }
};

/**
 * Send Delivery Confirmation Email
 */
export const sendDeliveryConfirmationEmail = async (user, order) => {
  try {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Your Order Has Been Delivered! ✓</h1>
            <p>Hi ${user.name},</p>
            <p>Your order has been successfully delivered!</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Total Amount:</strong> ₹${order.totals.grandTotal.toFixed(2)}</p>
              <p><strong>Delivered on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>We hope you love your purchase! If you have any feedback or concerns, we'd love to hear from you.</p>
            <p>Thank you for shopping with us!</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Your Order Has Been Delivered! Order #${order._id.toString().slice(-8)}`,
      html,
      text: `Hi ${user.name},\n\nYour order has been successfully delivered! Order ID: ${order._id}`,
    });
    logger.info(`Delivery confirmation email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send delivery confirmation email: ${error.message}`);
  }
};
