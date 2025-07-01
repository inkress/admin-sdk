/**
 * Webhook Handling Example with Express.js
 * 
 * This example shows how to handle Inkress webhooks using Express.js
 * and the webhook utilities provided by the SDK.
 */

import express from 'express';
import { WebhookUtils, createWebhookMiddleware } from '../src';

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.INKRESS_WEBHOOK_SECRET || 'your-webhook-secret';

// Parse raw body for webhook verification
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// Apply webhook verification middleware
app.use('/webhooks/inkress', createWebhookMiddleware(WEBHOOK_SECRET));

// Handle Inkress webhooks
app.post('/webhooks/inkress', (req: any, res) => {
  try {
    const { webhookPayload } = req;
    
    console.log(`📩 Received webhook: ${webhookPayload.event.type}`);
    console.log(`🔍 Event ID: ${webhookPayload.id}`);
    console.log(`⏰ Timestamp: ${new Date(webhookPayload.timestamp * 1000).toISOString()}`);
    
    // Handle different event types
    switch (webhookPayload.event.type) {
      case 'payment.succeeded':
        handlePaymentSucceeded(webhookPayload.event.data);
        break;
        
      case 'payment.failed':
        handlePaymentFailed(webhookPayload.event.data);
        break;
        
      case 'order.created':
        handleOrderCreated(webhookPayload.event.data);
        break;
        
      case 'order.updated':
        handleOrderUpdated(webhookPayload.event.data);
        break;
        
      case 'subscription.cancelled':
        handleSubscriptionCancelled(webhookPayload.event.data);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${webhookPayload.event.type}`);
    }
    
    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual webhook verification endpoint (without middleware)
app.post('/webhooks/manual', (req, res) => {
  try {
    const signature = req.headers['inkress-signature'] as string;
    const payload = req.body;
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }
    
    // Verify signature manually
    const isValid = WebhookUtils.verifySignature(
      payload,
      signature,
      WEBHOOK_SECRET,
      { tolerance: 300 } // 5 minutes tolerance
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse payload
    const webhookPayload = WebhookUtils.parsePayload(payload);
    console.log(`📩 Manual verification - Event: ${webhookPayload.event.type}`);
    
    res.status(200).json({ received: true, verified: true });
    
  } catch (error) {
    console.error('❌ Manual webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Test endpoint to generate webhook signatures
app.post('/webhooks/test', (req, res) => {
  try {
    const testPayload = WebhookUtils.createTestPayload({
      id: 'test_event_123',
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_123',
        amount: 29.99,
        currency: 'USD'
      },
      created_at: new Date().toISOString()
    });
    
    const payload = JSON.stringify(testPayload);
    const signature = WebhookUtils.generateSignature(payload, WEBHOOK_SECRET);
    
    res.json({
      payload: testPayload,
      signature,
      instructions: 'Use this payload and signature to test your webhook endpoint'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    webhook_secret_configured: !!WEBHOOK_SECRET
  });
});

// Event handlers
function handlePaymentSucceeded(data: any) {
  console.log(`✅ Payment succeeded: ${data.payment_id} ($${data.amount} ${data.currency})`);
  
  // Your business logic here:
  // - Update order status
  // - Send confirmation email
  // - Trigger fulfillment
  // - Update analytics
}

function handlePaymentFailed(data: any) {
  console.log(`❌ Payment failed: ${data.payment_id} - ${data.failure_reason}`);
  
  // Your business logic here:
  // - Update order status
  // - Send failure notification
  // - Clear reserved inventory
  // - Log for analysis
}

function handleOrderCreated(data: any) {
  console.log(`📦 Order created: ${data.order_id} ($${data.amount} ${data.currency})`);
  
  // Your business logic here:
  // - Reserve inventory
  // - Send order confirmation
  // - Calculate shipping
  // - Update customer records
}

function handleOrderUpdated(data: any) {
  console.log(`📝 Order updated: ${data.order_id} - Status: ${data.status}`);
  
  // Your business logic here:
  // - Update internal systems
  // - Send status notifications
  // - Track fulfillment progress
}

function handleSubscriptionCancelled(data: any) {
  console.log(`🚫 Subscription cancelled: ${data.subscription_id}`);
  
  // Your business logic here:
  // - Update customer access
  // - Send cancellation confirmation
  // - Process refunds if needed
  // - Update billing systems
}

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📡 Inkress webhook endpoint: http://localhost:${PORT}/webhooks/inkress`);
  console.log(`🔧 Manual verification endpoint: http://localhost:${PORT}/webhooks/manual`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/webhooks/test`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
});

export default app;
