/**
 * Webhook Verification Quick Start
 * 
 * This example demonstrates the new webhook verification methods
 * available directly on the SDK webhookUrls resource.
 */

import { InkressSDK } from '@inkress/admin-sdk';

// Initialize SDK
const inkress = new InkressSDK({
  accessToken: process.env.INKRESS_API_KEY!,
  mode: 'live',
});

const WEBHOOK_SECRET = process.env.INKRESS_WEBHOOK_SECRET!;

// ============================================================================
// Example 1: Simple webhook verification (recommended)
// ============================================================================

async function handleWebhookSimple(request: any) {
  try {
    // Verify signature and parse payload in one step
    const payload = await inkress.webhookUrls.verifyRequest(
      { 
        headers: request.headers, 
        body: request.body 
      },
      WEBHOOK_SECRET
    );

    console.log('✅ Webhook verified!');
    console.log('Event:', payload.event.action);
    console.log('ID:', payload.id);
    
    // Process the webhook
    await processWebhook(payload);
    
  } catch (error: any) {
    console.error('❌ Webhook verification failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 2: Webhook verification with timestamp tolerance
// ============================================================================

async function handleWebhookWithTolerance(request: any) {
  try {
    // Only accept webhooks from the last 5 minutes
    const payload = await inkress.webhookUrls.verifyRequest(
      { headers: request.headers, body: request.body },
      WEBHOOK_SECRET,
      { tolerance: 300 } // 5 minutes in seconds
    );

    console.log('✅ Webhook verified and within time tolerance!');
    await processWebhook(payload);
    
  } catch (error: any) {
    if (error.message.includes('timestamp outside tolerance')) {
      console.error('⏰ Webhook too old, rejecting');
    } else {
      console.error('❌ Webhook verification failed:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// Example 3: Manual signature verification (advanced)
// ============================================================================

async function handleWebhookManual(request: any) {
  const signature = request.headers['x-inkress-webhook-signature'];
  const body = typeof request.body === 'string' 
    ? request.body 
    : JSON.stringify(request.body);

  try {
    // Verify signature only
    await inkress.webhookUrls.verify(body, signature, WEBHOOK_SECRET);
    
    // Parse payload manually
    const payload = JSON.parse(body);
    
    console.log('✅ Manual verification successful!');
    await processWebhook(payload);
    
  } catch (error: any) {
    console.error('❌ Manual verification failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 4: Extract typed event data
// ============================================================================

interface OrderCreatedData {
  order: {
    id: number;
    total: number;
    status: string;
    customer: {
      email: string;
      name: string;
    };
  };
}

async function handleOrderCreatedWebhook(request: any) {
  try {
    const payload = await inkress.webhookUrls.verifyRequest(
      { headers: request.headers, body: request.body },
      WEBHOOK_SECRET
    );

    if (payload.event.action === 'order.created') {
      // Extract typed event data
      const orderData = inkress.webhookUrls.extractEventData<OrderCreatedData>(payload);
      
      console.log('New order:', orderData.order.id);
      console.log('Customer:', orderData.order.customer.email);
      console.log('Total:', orderData.order.total);
      
      // Process order...
    }
    
  } catch (error: any) {
    console.error('❌ Webhook processing failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 5: Testing webhook signatures
// ============================================================================

function generateTestWebhook() {
  const testPayload = {
    id: `test_${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000),
    event: {
      action: 'payment.succeeded',
      jwt: 'test_jwt_token',
      data: {
        payment_id: 'pay_123',
        amount: 2999,
        currency: 'USD',
      }
    }
  };

  const body = JSON.stringify(testPayload);
  const signature = inkress.webhookUrls.generateSignature(body, WEBHOOK_SECRET);

  console.log('Test webhook generated:');
  console.log('Body:', body);
  console.log('Signature:', signature);
  console.log('\nTest with curl:');
  console.log(`curl -X POST http://localhost:3000/webhooks \\
  -H "Content-Type: application/json" \\
  -H "X-Inkress-Webhook-Signature: ${signature}" \\
  -d '${body}'`);
}

// ============================================================================
// Helper function to process webhooks
// ============================================================================

async function processWebhook(payload: any) {
  switch (payload.event.action) {
    case 'payment.succeeded':
      console.log('💳 Processing successful payment...');
      // Handle payment success
      break;
      
    case 'order.created':
      console.log('📦 Processing new order...');
      // Handle new order
      break;
      
    case 'subscription.cancelled':
      console.log('🔄 Processing subscription cancellation...');
      // Handle subscription cancellation
      break;
      
    default:
      console.log(`ℹ️ Unhandled event: ${payload.event.action}`);
  }
}

// ============================================================================
// Express.js integration example
// ============================================================================

/*
import express from 'express';

const app = express();

// IMPORTANT: Use raw body for webhook signature verification
app.use('/webhooks', express.text({ type: 'application/json' }));

app.post('/webhooks/inkress', async (req, res) => {
  try {
    const payload = await inkress.webhookUrls.verifyRequest(
      { headers: req.headers, body: req.body },
      WEBHOOK_SECRET,
      { tolerance: 300 }
    );
    
    // Process webhook asynchronously
    processWebhook(payload).catch(console.error);
    
    // Respond immediately to Inkress
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
*/

export {
  handleWebhookSimple,
  handleWebhookWithTolerance,
  handleWebhookManual,
  handleOrderCreatedWebhook,
  generateTestWebhook,
};
