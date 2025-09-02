import Stripe from 'stripe';
import Order from '../models/order.js';

const stripe = new Stripe('sk_test_51Ql5QiIVYLEPquIEboxMYrKcuu8fFC18QIjgoz3C81ih6QJEXa7PY1n15dNU7YjfAeggWJNtLFA6OOZIQhOkuB2T00zg5lkcCR');

// Create a payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'lkr', orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency,
      metadata: {
        orderId: orderId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Handle Stripe webhooks
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'; // Get from Stripe dashboard

  let event;

  try {
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return res.status(400).send('Webhook secret not configured');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntentSucceeded.id);
        
        // Update order status to processing
        await Order.findByIdAndUpdate(
          paymentIntentSucceeded.metadata.orderId,
          {
            status: 'processing',
            paymentcompleted: true,
            paymentMethod: 'credit_card',
            paymentDetails: {
              stripePaymentIntentId: paymentIntentSucceeded.id,
              cardBrand: paymentIntentSucceeded.payment_method_details?.card?.brand,
              last4: paymentIntentSucceeded.payment_method_details?.card?.last4
            }
          }
        );
        
        // Here you might want to:
        // 1. Send confirmation email to customer
        // 2. Update inventory
        // 3. Notify admin about new order
        
        break;
        
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object;
        console.log('PaymentIntent failed:', paymentIntentFailed.id);
        
        // Update order status to payment failed
        await Order.findByIdAndUpdate(
          paymentIntentFailed.metadata.orderId,
          {
            status: 'pending',
            paymentcompleted: false,
            paymentMethod: 'credit_card',
            paymentDetails: {
              error: paymentIntentFailed.last_payment_error?.message || 'Payment failed'
            }
          }
        );
        
        break;
        
      case 'charge.refunded':
        const chargeRefunded = event.data.object;
        console.log('Charge was refunded:', chargeRefunded.id);
        
        // Update order status to refunded
        await Order.findByIdAndUpdate(
          chargeRefunded.metadata.orderId,
          {
            status: 'refunded',
            paymentDetails: {
              ...chargeRefunded.payment_method_details,
              refunded: true,
              refundId: chargeRefunded.refunds.data[0]?.id
            }
          }
        );
        
        break;
        
      case 'charge.dispute.created':
        const disputeCreated = event.data.object;
        console.log('Dispute created:', disputeCreated.id);
        
        // Update order status to disputed
        await Order.findByIdAndUpdate(
          disputeCreated.metadata.orderId,
          { status: 'disputed' }
        );
        
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Get payment intent status
export const getPaymentIntentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: paymentIntent.created,
        payment_method: paymentIntent.payment_method,
        customer: paymentIntent.customer,
        metadata: paymentIntent.metadata
      }
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment intent',
      error: error.message
    });
  }
};

// Refund a payment
export const createRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount // Optional: specify amount to refund partially
    });

    res.status(200).json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create refund',
      error: error.message
    });
  }
};