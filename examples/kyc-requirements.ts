/**
 * KYC Document Requirements Example
 * 
 * This example demonstrates how to use the KYC document requirements
 * functionality to check required documents and track submission status.
 */

import { InkressSDK, EntityType, KYC_DOCUMENT_REQUIREMENTS } from '@inkress/admin-sdk';

// Initialize SDK
const inkress = new InkressSDK({
  accessToken: process.env.INKRESS_API_KEY!,
  username: 'merchant-username', // Your merchant username
  mode: 'live',
});

// ============================================================================
// Example 1: View required documents for an entity type (no API call)
// ============================================================================

function displayRequiredDocuments(entityType: EntityType) {
  const requiredDocs = inkress.kyc.getRequiredDocuments(entityType);
  
  console.log(`\n📋 Required KYC documents for ${entityType}:`);
  requiredDocs.forEach((doc, index) => {
    console.log(`  ${index + 1}. ${doc}`);
  });
  console.log(`\nTotal: ${requiredDocs.length} documents required\n`);
}

// Display requirements for different entity types
displayRequiredDocuments('personal');
displayRequiredDocuments('llc');

// ============================================================================
// Example 2: View all requirements at once (no API call)
// ============================================================================

function displayAllRequirements() {
  const allRequirements = inkress.kyc.getAllRequirements();
  
  console.log('\n📚 Complete KYC Requirements by Entity Type:\n');
  
  Object.entries(allRequirements).forEach(([entityType, docs]) => {
    console.log(`${entityType.toUpperCase()}:`);
    docs.forEach(doc => console.log(`  • ${doc}`));
    console.log('');
  });
}

displayAllRequirements();

// ============================================================================
// Example 3: Get KYC status for authenticated merchant (makes API call)
// ============================================================================

async function checkMerchantKycStatus(entityType: EntityType) {
  try {
    const response = await inkress.kyc.getRequirementsStatus(entityType);
    
    if (response.state === 'error') {
      console.error('Failed to fetch KYC status');
      return;
    }

    const status = response.result!;

    console.log('\n📊 KYC Verification Status:');
    console.log('━'.repeat(50));
    console.log(`Entity Type: ${status.entity_type}`);
    console.log(`Completion: ${status.completion_percentage}%`);
    console.log(`Complete: ${status.is_complete ? '✅ Yes' : '❌ No'}`);
    console.log('');
    console.log(`Documents:`);
    console.log(`  Required:  ${status.total_required}`);
    console.log(`  Submitted: ${status.total_submitted}`);
    console.log(`  Approved:  ${status.total_approved} ✅`);
    console.log(`  Pending:   ${status.total_pending} ⏳`);
    console.log(`  Rejected:  ${status.total_rejected} ❌`);
    console.log('');

    // Display individual document status
    console.log('📄 Document Details:');
    console.log('━'.repeat(50));
    
    status.document_statuses.forEach(doc => {
      const icon = doc.status === 'approved' ? '✅' 
                 : doc.status === 'pending' ? '⏳' 
                 : doc.status === 'rejected' ? '❌' 
                 : '⬜';
      
      const statusText = doc.submitted 
        ? `${doc.status || 'unknown'}` 
        : 'not submitted';
      
      console.log(`${icon} ${doc.document_type}`);
      console.log(`   Status: ${statusText}`);
      
      if (doc.submitted_at) {
        console.log(`   Submitted: ${new Date(doc.submitted_at).toLocaleDateString()}`);
      }
      
      if (doc.rejection_reason) {
        console.log(`   Reason: ${doc.rejection_reason}`);
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('Error checking KYC status:', error);
  }
}

// ============================================================================
// Example 4: Check if KYC is complete
// ============================================================================

async function isVerified(entityType: EntityType) {
  try {
    const isComplete = await inkress.kyc.isKycComplete(entityType);
    
    if (isComplete) {
      console.log('✅ Merchant is fully verified!');
      console.log('   All required documents have been approved.');
    } else {
      console.log('⚠️ Merchant verification incomplete.');
      console.log('   Please submit or resubmit required documents.');
    }
    
    return isComplete;
  } catch (error) {
    console.error('Error checking verification status:', error);
    return false;
  }
}

// ============================================================================
// Example 5: Get missing documents
// ============================================================================

async function getMissingDocumentsList(entityType: EntityType) {
  try {
    const missingDocs = await inkress.kyc.getMissingDocuments(entityType);
    
    if (missingDocs.length === 0) {
      console.log('✅ No missing documents! All documents submitted and approved.');
      return [];
    }

    console.log('\n📝 Missing or Rejected Documents:');
    console.log('━'.repeat(50));
    missingDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc}`);
    });
    console.log('');
    console.log(`Please submit ${missingDocs.length} document(s) to complete verification.`);
    
    return missingDocs;
  } catch (error) {
    console.error('Error fetching missing documents:', error);
    return [];
  }
}

// ============================================================================
// Example 6: Complete merchant onboarding flow
// ============================================================================

async function merchantOnboardingCheck(entityType: EntityType) {
  console.log('\n🚀 Starting Merchant KYC Onboarding Check...\n');

  // Step 1: Show required documents
  console.log('STEP 1: Required Documents');
  displayRequiredDocuments(entityType);

  // Step 2: Check current status
  console.log('STEP 2: Current Verification Status');
  await checkMerchantKycStatus(entityType);

  // Step 3: Check if complete
  console.log('STEP 3: Verification Complete?');
  const isComplete = await isVerified(entityType);

  // Step 4: If not complete, show what's missing
  if (!isComplete) {
    console.log('\nSTEP 4: Action Items');
    await getMissingDocumentsList(entityType);
  } else {
    console.log('\n🎉 Merchant is ready to accept payments!');
  }
}

// ============================================================================
// Example 7: Document submission helper
// ============================================================================

async function submitDocument(documentType: string, documentUrl: string) {
  try {
    const response = await inkress.kyc.uploadDocument({
      kind: 'document_submission',
      data: {
        document_type: documentType,
        document_url: documentUrl,
      },
    });

    if (response.state === 'ok') {
      console.log(`✅ Successfully submitted: ${documentType}`);
      console.log(`   Status: ${response.result?.status}`);
      console.log(`   Request ID: ${response.result?.id}`);
    } else {
      console.error(`❌ Failed to submit: ${documentType}`);
    }

    return response;
  } catch (error) {
    console.error(`Error submitting ${documentType}:`, error);
    throw error;
  }
}

// ============================================================================
// Example 8: Bulk document status check
// ============================================================================

async function generateKycChecklist(entityType: EntityType) {
  const response = await inkress.kyc.getRequirementsStatus(entityType);
  
  if (response.state === 'error' || !response.result) {
    console.error('Failed to generate checklist');
    return;
  }

  const status = response.result;

  console.log('\n📋 KYC Document Checklist\n');
  console.log('━'.repeat(60));
  console.log(`Entity Type: ${entityType.toUpperCase()}`);
  console.log(`Progress: ${'█'.repeat(Math.floor(status.completion_percentage / 10))}${'░'.repeat(10 - Math.floor(status.completion_percentage / 10))} ${status.completion_percentage}%`);
  console.log('━'.repeat(60));
  console.log('');

  status.document_statuses.forEach((doc, index) => {
    const checkbox = doc.status === 'approved' ? '[✓]' 
                   : doc.status === 'pending' ? '[⋯]'
                   : doc.status === 'rejected' ? '[✗]'
                   : '[ ]';
    
    console.log(`${checkbox} ${index + 1}. ${doc.document_type}`);
    
    if (doc.status === 'rejected' && doc.rejection_reason) {
      console.log(`    ⚠️  Rejection reason: ${doc.rejection_reason}`);
    }
  });

  console.log('');
  console.log('Legend: [✓] Approved  [⋯] Pending  [✗] Rejected  [ ] Not Submitted');
  console.log('━'.repeat(60));
}

// ============================================================================
// Usage Examples
// ============================================================================

async function main() {
  // Example: Check status for an LLC merchant
  await merchantOnboardingCheck('llc');

  // Example: Generate a simple checklist
  await generateKycChecklist('personal');

  // Example: Check missing documents for authenticated merchant
  const missing = await getMissingDocumentsList('sole-trader');
  
  // Example: Submit a document
  if (missing.length > 0) {
    await submitDocument(
      missing[0],
      'https://example.com/documents/proof-of-identity.pdf'
    );
  }
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

export {
  displayRequiredDocuments,
  displayAllRequirements,
  checkMerchantKycStatus,
  isVerified,
  getMissingDocumentsList,
  merchantOnboardingCheck,
  submitDocument,
  generateKycChecklist,
};
