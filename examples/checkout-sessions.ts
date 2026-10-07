/**
 * Checkout Sessions Example
 * 
 * This example demonstrates how to use the embedded checkout feature
 * to accept card payments directly on your website via an iframe.
 */

import { InkressSDK } from '../src';

const inkress = new InkressSDK({
  accessToken: process.env.INKRESS_ACCESS_TOKEN || 'your-jwt-token',
  username: process.env.INKRESS_USERNAME || 'your-merchant-username',
  mode: 'sandbox', // Use 'live' for production
});

// =============================================================================
// BASIC CHECKOUT SESSION CREATION
// =============================================================================

async function createBasicCheckoutSession() {
  console.log('Creating basic checkout session...\n');

  const session = await inkress.checkoutSessions.create({
    reference_id: `order-${Date.now()}`,
    total: 100.00,
    kind: 'online',
    currency_code: 'JMD',
    title: 'Premium Widget',
    customer: {
      email: 'customer@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1876555123'
    }
  });

  if (session.state === 'ok' && session.result) {
    console.log('✅ Checkout session created successfully!\n');
    console.log('Session ID:', session.result.session_id);
    console.log('Reference ID:', session.result.reference_id);
    console.log('Frame URL:', session.result.frame_url);
    console.log('Expires:', new Date(session.result.expires).toISOString());
    console.log('\nTotals:');
    console.log('  Customer pays:', session.result.totals.customer_total);
    console.log('  Merchant receives:', session.result.totals.merchant_total);
    console.log('  Platform fee:', session.result.totals.platform_total);
    console.log('  Provider fee:', session.result.totals.provider_total);
  }

  return session;
}

// =============================================================================
// GET CHECKOUT SESSION STATUS
// =============================================================================

async function getCheckoutSessionStatus(sessionId: string) {
  console.log(`\nFetching session status for: ${sessionId}...\n`);

  const session = await inkress.checkoutSessions.get(sessionId);

  if (session.state === 'ok' && session.result) {
    console.log('Session Status:', session.result.status);
    console.log('Order ID:', session.result.order_id || 'Not yet created');
    console.log('Created At:', session.result.created_at);
    console.log('Completed At:', session.result.completed_at || 'Not completed');
    
    // Check payment status
    switch (session.result.status) {
      case 'pending':
        console.log('\n⏳ Session created, awaiting customer action');
        break;
      case 'awaiting_payment':
        console.log('\n💳 Customer is entering payment details');
        break;
      case 'completed':
        console.log('\n✅ Payment completed successfully!');
        break;
      case 'cancelled':
        console.log('\n❌ Session was cancelled');
        break;
      case 'expired':
        console.log('\n⏰ Session has expired');
        break;
    }
  }

  return session;
}

// =============================================================================
// CANCEL CHECKOUT SESSION
// =============================================================================

async function cancelCheckoutSession(sessionId: string) {
  console.log(`\nCancelling session: ${sessionId}...\n`);

  const result = await inkress.checkoutSessions.delete(sessionId);

  if (result.state === 'ok') {
    console.log('✅ Session cancelled successfully');
    console.log('Result:', result.result);
  }

  return result;
}

// =============================================================================
// FRONTEND INTEGRATION EXAMPLE (Browser Code)
// =============================================================================

/**
 * This code would run in the browser to handle the embedded checkout.
 * Copy this to your frontend application.
 */
const frontendIntegrationExample = `
// Frontend code for handling embedded checkout

interface CheckoutOptions {
  containerId: string;
  sessionId: string;
  frameUrl: string;
  onPaymentStarted?: () => void;
  onPaymentComplete?: (success: boolean, orderId?: string) => void;
  onError?: (error: Error) => void;
}

class EmbeddedCheckout {
  private iframe: HTMLIFrameElement | null = null;
  private options: CheckoutOptions;
  private messageHandler: (event: MessageEvent) => void;

  constructor(options: CheckoutOptions) {
    this.options = options;
    this.messageHandler = this.handleMessage.bind(this);
  }

  mount() {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      throw new Error(\`Container element not found: \${this.options.containerId}\`);
    }

    // Create and configure iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.options.frameUrl;
    this.iframe.style.cssText = 'width: 100%; height: 600px; border: none; border-radius: 8px;';
    this.iframe.allow = 'payment';
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

    // Add to container
    container.innerHTML = '';
    container.appendChild(this.iframe);

    // Listen for messages from iframe
    window.addEventListener('message', this.messageHandler);

    console.log('Checkout iframe mounted');
  }

  private handleMessage(event: MessageEvent) {
    // Security: verify origin
    const allowedOrigins = [
      'https://checkout.inkress.com',
      'https://dev.inkress.com',
      'https://inkress.com'
    ];
    
    if (!allowedOrigins.includes(event.origin)) {
      return;
    }

    const { type, data } = event.data || {};

    switch (type) {
      case 'frame_unload':
        // Card information entered, payment is being processed
        console.log('Payment processing started...');
        this.options.onPaymentStarted?.();
        break;

      case 'payment_posted':
        // Payment attempt completed
        console.log('Payment posted:', data);
        this.handlePaymentPosted(data);
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }

  private async handlePaymentPosted(data: any) {
    try {
      // Fetch updated session status from your backend
      const response = await fetch(\`/api/checkout/sessions/\${this.options.sessionId}\`);
      const session = await response.json();

      if (session.status === 'completed') {
        this.options.onPaymentComplete?.(true, session.order_id);
      } else {
        this.options.onPaymentComplete?.(false);
      }
    } catch (error) {
      this.options.onError?.(error as Error);
    }
  }

  unmount() {
    window.removeEventListener('message', this.messageHandler);
    if (this.iframe?.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
    this.iframe = null;
  }
}

// Usage example:
async function startCheckout() {
  // 1. Create session via your backend API
  const response = await fetch('/api/checkout/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      total: 99.99,
      currency: 'JMD',
      customer: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1876555123'
      }
    })
  });
  
  const session = await response.json();

  // 2. Initialize embedded checkout
  const checkout = new EmbeddedCheckout({
    containerId: 'checkout-container',
    sessionId: session.session_id,
    frameUrl: session.frame_url,
    
    onPaymentStarted: () => {
      document.getElementById('loading')!.style.display = 'block';
    },
    
    onPaymentComplete: (success, orderId) => {
      document.getElementById('loading')!.style.display = 'none';
      
      if (success) {
        window.location.href = \`/order-confirmation/\${orderId}\`;
      } else {
        alert('Payment failed. Please try again.');
      }
    },
    
    onError: (error) => {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    }
  });

  // 3. Mount the checkout iframe
  checkout.mount();

  // 4. Handle session expiration
  const expiresIn = session.expires - Date.now();
  setTimeout(() => {
    checkout.unmount();
    alert('Your session has expired. Please try again.');
    window.location.reload();
  }, expiresIn);
}
`;

// =============================================================================
// EXPRESS.JS BACKEND EXAMPLE
// =============================================================================

const expressBackendExample = `
// Express.js backend routes for checkout sessions

import express from 'express';
import { InkressSDK } from '@inkress/admin-sdk';

const router = express.Router();
const inkress = new InkressSDK({
  accessToken: process.env.INKRESS_ACCESS_TOKEN!,
  username: process.env.INKRESS_USERNAME!,
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
});

// Create a new checkout session
router.post('/api/checkout/sessions', async (req, res) => {
  try {
    const { total, currency, customer, products } = req.body;

    const session = await inkress.checkoutSessions.create({
      reference_id: \`order-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      total,
      kind: 'online',
      currency_code: currency,
      title: 'Your Order',
      customer: {
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone
      },
      products
    });

    if (session.state === 'ok') {
      res.json({
        session_id: session.result!.session_id,
        frame_url: session.result!.frame_url,
        expires: session.result!.expires,
        totals: session.result!.totals
      });
    } else {
      res.status(400).json({ error: 'Failed to create checkout session' });
    }
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get checkout session status
router.get('/api/checkout/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await inkress.checkoutSessions.get(sessionId);

    if (session.state === 'ok') {
      res.json(session.result);
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel checkout session
router.delete('/api/checkout/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await inkress.checkoutSessions.delete(sessionId);

    if (result.state === 'ok') {
      res.json({ success: true, message: result.result });
    } else {
      res.status(400).json({ error: 'Failed to cancel session' });
    }
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
`;

// =============================================================================
// RUN EXAMPLES
// =============================================================================

async function runExamples() {
  console.log('='.repeat(60));
  console.log('CHECKOUT SESSIONS EXAMPLES');
  console.log('='.repeat(60));

  try {
    // Create a session
    const session = await createBasicCheckoutSession();

    if (session.state === 'ok' && session.result) {
      const sessionId = session.result.session_id;

      // Get session status
      await getCheckoutSessionStatus(sessionId);

      // Optionally cancel the session (uncomment to test)
      // await cancelCheckoutSession(sessionId);
    }

    // Print frontend integration example
    console.log('\n' + '='.repeat(60));
    console.log('FRONTEND INTEGRATION EXAMPLE');
    console.log('='.repeat(60));
    console.log('\nCopy the following code to your frontend application:');
    console.log(frontendIntegrationExample);

    // Print backend integration example
    console.log('\n' + '='.repeat(60));
    console.log('EXPRESS.JS BACKEND EXAMPLE');
    console.log('='.repeat(60));
    console.log('\nCopy the following code to your Express.js backend:');
    console.log(expressBackendExample);

  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if executed directly
runExamples().catch(console.error);
