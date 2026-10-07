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
app.use('/webhooks', express.text({ type: 'application/json' }));
app.use(express.json());

// Apply webhook verification middleware
app.use('/webhooks/inkress', createWebhookMiddleware(WEBHOOK_SECRET));

// Handle Inkress webhooks
app.post('/webhooks/inkress', (req: any, res) => {
  try {
    const { webhookPayload } = req;
    
    console.log(`📩 Received webhook: ${webhookPayload.event.action}`);
    console.log(`🔍 Event ID: ${webhookPayload.id}`);
    console.log(`⏰ Timestamp: ${new Date(webhookPayload.timestamp * 1000).toISOString()}`);
    
    // Handle different event types
    switch (webhookPayload.event.action) {
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
    const signature = req.headers['x-inkress-webhook-signature'] as string;
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing X-Inkress-Webhook-Signature header' });
    }
    
    // Verify signature manually
    const isValid = WebhookUtils.verifySignature(body, signature, WEBHOOK_SECRET);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse payload
    const webhookPayload = WebhookUtils.parsePayload(body);
    console.log(`📩 Manual verification - Event: ${webhookPayload.event.action}`);
    
    res.status(200).json({ received: true, verified: true });
    
  } catch (error: any) {
    console.error('❌ Manual webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Alternate manual verification using verifyRequest helper
app.post('/webhooks/request-helper', (req, res) => {
  try {
    // Use the verifyRequest helper that extracts everything from the request
    const { isValid, body } = WebhookUtils.verifyRequest(req, WEBHOOK_SECRET);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse payload (body is already extracted and verified)
    const webhookPayload = WebhookUtils.parsePayload(body);
    console.log(`📩 Request helper verification - Event: ${webhookPayload.event.type}`);
    
    res.status(200).json({ received: true, verified: true });
    
  } catch (error: any) {
    console.error('❌ Request helper error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Test endpoint to generate webhook signatures
app.post('/webhooks/test', (req, res) => {
  try {
    const testPayload = WebhookUtils.createTestPayload({
      action: 'payment',
      jwt: 'test_jwt_token',
      data: {
        payment_id: 'pay_123',
        amount: 29.99,
        currency: 'USD',
        status: 'completed'
      }
    });
    
    const body = JSON.stringify(testPayload);
    const signature = WebhookUtils.generateSignature(body, WEBHOOK_SECRET);
    
    res.json({
      payload: testPayload,
      headers: {
        'X-Inkress-Webhook-Signature': signature
      },
      curl_example: `curl -X POST http://localhost:${PORT}/webhooks/inkress \\
  -H "Content-Type: application/json" \\
  -H "X-Inkress-Webhook-Signature: ${signature}" \\
  -d '${body}'`,
      instructions: 'Use this payload and signature to test your webhook endpoint'
    });
    
  } catch (error: any) {
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
function handlePayment(data: any) {
  console.log(`💳 Payment event: ${data.payment_status || 'unknown status'}`);
  
  if (data.payment_status === 'succeeded' || data.payment_status === 'completed') {
    console.log(`✅ Payment succeeded: ${data.payment_id} ($${data.amount || 0})`);
    // Your business logic here:
    // - Update order status
    // - Send confirmation email
    // - Trigger fulfillment
    // - Update analytics
  } else if (data.payment_status === 'failed') {
    console.log(`❌ Payment failed: ${data.payment_id}`);
    // Your business logic here:
    // - Update order status
    // - Send failure notification
    // - Clear reserved inventory
    // - Log for analysis
  }
}

function handleOrder(data: any) {
  console.log(`📦 Order event: ${data.order?.id || 'unknown'} - Status: ${data.order?.status || 'unknown'}`);
  
  // Your business logic here:
  // - Reserve inventory
  // - Send order confirmation
  // - Calculate shipping
  // - Update customer records
  // - Track fulfillment progress
}

function handleSubscription(data: any) {
  console.log(`🔄 Subscription event: ${data.subscription_id || 'unknown'}`);
  
  // Your business logic here:
  // - Update customer access
  // - Send notifications
  // - Process refunds if needed
  // - Update billing systems
}

function handleRegistration(data: any) {
  console.log(`👤 Registration event: ${data.client_id || 'unknown'}`);
  
  // Your business logic here:
  // - Save client credentials
  // - Setup merchant account
  // - Send welcome email
  // - Initialize settings
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
  console.log(`🔧 Request helper endpoint: http://localhost:${PORT}/webhooks/request-helper`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/webhooks/test`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
  console.log(`\n📝 Webhook secret: ${WEBHOOK_SECRET ? '✅ Configured' : '⚠️ Using default'}`);
  console.log(`📝 Set INKRESS_WEBHOOK_SECRET environment variable for production use`);
});

export default app;
