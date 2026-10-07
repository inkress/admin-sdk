import { InkressSDK } from '../index';
import { KYC_DOCUMENT_REQUIREMENTS, EntityType, KycDocumentType } from '../resources/kyc';
import { StatusTranslator } from '../utils/translators';

describe('KycResource - Document Requirements', () => {
  let sdk: InkressSDK;

  beforeEach(() => {
    sdk = new InkressSDK({
      accessToken: 'test-token',
      mode: 'sandbox',
    });
  });

  describe('KYC_DOCUMENT_REQUIREMENTS constant', () => {
    test('should have requirements for all entity types', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS.personal).toBeDefined();
      expect(KYC_DOCUMENT_REQUIREMENTS['sole-trader']).toBeDefined();
      expect(KYC_DOCUMENT_REQUIREMENTS.llc).toBeDefined();
      expect(KYC_DOCUMENT_REQUIREMENTS['non-profit']).toBeDefined();
      expect(KYC_DOCUMENT_REQUIREMENTS.alumni).toBeDefined();
      expect(KYC_DOCUMENT_REQUIREMENTS.other).toBeDefined();
    });

    test('personal entity should have 3 required documents', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS.personal).toHaveLength(3);
      expect(KYC_DOCUMENT_REQUIREMENTS.personal).toContain('Proof of Identity');
      expect(KYC_DOCUMENT_REQUIREMENTS.personal).toContain('Proof of Address');
      expect(KYC_DOCUMENT_REQUIREMENTS.personal).toContain('Proof of Bank Account Ownership');
    });

    test('sole-trader entity should have 5 required documents', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS['sole-trader']).toHaveLength(5);
      expect(KYC_DOCUMENT_REQUIREMENTS['sole-trader']).toContain('Business Certificate');
      expect(KYC_DOCUMENT_REQUIREMENTS['sole-trader']).toContain('Articles of Incorporation');
    });

    test('llc entity should have 9 required documents', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS.llc).toHaveLength(9);
      expect(KYC_DOCUMENT_REQUIREMENTS.llc).toContain('Annual Return');
      expect(KYC_DOCUMENT_REQUIREMENTS.llc).toContain('Notice of Directors');
      expect(KYC_DOCUMENT_REQUIREMENTS.llc).toContain('Notice of Secretary');
      expect(KYC_DOCUMENT_REQUIREMENTS.llc).toContain('Tax Compliance Certificate');
    });

    test('non-profit entity should have 6 required documents', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS['non-profit']).toHaveLength(6);
    });

    test('alumni entity should have 6 required documents', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS.alumni).toHaveLength(6);
    });

    test('other entity should have 9 required documents', () => {
      expect(KYC_DOCUMENT_REQUIREMENTS.other).toHaveLength(9);
    });
  });

  describe('getRequiredDocuments', () => {
    test('should return required documents for personal entity', () => {
      const docs = sdk.kyc.getRequiredDocuments('personal');
      expect(docs).toHaveLength(3);
      expect(docs).toContain('Proof of Identity');
    });

    test('should return required documents for llc entity', () => {
      const docs = sdk.kyc.getRequiredDocuments('llc');
      expect(docs).toHaveLength(9);
      expect(docs).toContain('Tax Compliance Certificate');
    });

    test('should return a new array (not the original)', () => {
      const docs1 = sdk.kyc.getRequiredDocuments('personal');
      const docs2 = sdk.kyc.getRequiredDocuments('personal');
      expect(docs1).not.toBe(docs2);
      expect(docs1).toEqual(docs2);
    });
  });

  describe('getAllRequirements', () => {
    test('should return all entity type requirements', () => {
      const all = sdk.kyc.getAllRequirements();
      expect(Object.keys(all)).toHaveLength(6);
      expect(all.personal).toBeDefined();
      expect(all['sole-trader']).toBeDefined();
      expect(all.llc).toBeDefined();
    });

    test('should return a new object (not the original)', () => {
      const all1 = sdk.kyc.getAllRequirements();
      const all2 = sdk.kyc.getAllRequirements();
      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });

  describe('Type exports', () => {
    test('EntityType should include all entity types', () => {
      const entityTypes: EntityType[] = [
        'personal',
        'sole-trader',
        'llc',
        'non-profit',
        'alumni',
        'other'
      ];
      
      entityTypes.forEach(type => {
        expect(KYC_DOCUMENT_REQUIREMENTS[type]).toBeDefined();
      });
    });

    test('KycDocumentType should include all document types', () => {
      const documentTypes: KycDocumentType[] = [
        'Proof of Identity',
        'Proof of Address',
        'Proof of Bank Account Ownership',
        'Business Certificate',
        'Articles of Incorporation',
        'Annual Return',
        'Notice of Directors',
        'Notice of Secretary',
        'Tax Compliance Certificate',
      ];

      // Check that each document type appears in at least one entity requirement
      documentTypes.forEach(docType => {
        const found = Object.values(KYC_DOCUMENT_REQUIREMENTS).some(
          requirements => requirements.includes(docType)
        );
        expect(found).toBe(true);
      });
    });
  });

  describe('Document requirements logic', () => {
    test('all entity types should require basic documents', () => {
      const basicDocs: KycDocumentType[] = [
        'Proof of Identity',
        'Proof of Address',
        'Proof of Bank Account Ownership',
      ];

      Object.values(KYC_DOCUMENT_REQUIREMENTS).forEach(requirements => {
        basicDocs.forEach(doc => {
          expect(requirements).toContain(doc);
        });
      });
    });

    test('business entities should require additional documents', () => {
      const businessDocs: KycDocumentType[] = [
        'Business Certificate',
        'Articles of Incorporation',
      ];

      const businessEntities: EntityType[] = ['sole-trader', 'llc', 'non-profit', 'alumni', 'other'];
      
      businessEntities.forEach(entityType => {
        businessDocs.forEach(doc => {
          expect(KYC_DOCUMENT_REQUIREMENTS[entityType]).toContain(doc);
        });
      });
    });

    test('llc and other should have the most requirements', () => {
      const llcCount = KYC_DOCUMENT_REQUIREMENTS.llc.length;
      const otherCount = KYC_DOCUMENT_REQUIREMENTS.other.length;

      expect(llcCount).toBe(9);
      expect(otherCount).toBe(9);

      Object.entries(KYC_DOCUMENT_REQUIREMENTS).forEach(([type, requirements]) => {
        if (type !== 'llc' && type !== 'other') {
          expect(requirements.length).toBeLessThanOrEqual(llcCount);
        }
      });
    });
  });

  describe('Status Translation', () => {
    test('StatusTranslator should convert legal_request statuses correctly', () => {
      // Test the translator directly
      expect(StatusTranslator.toStringWithoutContext(1, 'legal_request')).toBe('pending');
      expect(StatusTranslator.toStringWithoutContext(2, 'legal_request')).toBe('in_review');
      expect(StatusTranslator.toStringWithoutContext(3, 'legal_request')).toBe('approved');
      expect(StatusTranslator.toStringWithoutContext(4, 'legal_request')).toBe('rejected');
    });

    test('should properly convert integer statuses from API to string statuses', async () => {
      // Mock the HTTP client to return integer statuses as the API does
      const mockResponse = {
        state: 'ok' as const,
        result: {
          entries: [
            {
              id: 1,
              kind: 1, // document_submission
              status: 1, // pending (integer from API)
              data: { 
                document_type: 'Proof of Identity',
                document_url: 'https://example.com/id.pdf'
              },
              inserted_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            {
              id: 2,
              kind: 1,
              status: 2, // in_review (integer from API)
              data: { 
                document_type: 'Proof of Address',
                document_url: 'https://example.com/address.pdf'
              },
              inserted_at: '2024-01-02T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
            },
            {
              id: 3,
              kind: 1,
              status: 3, // approved (integer from API)
              data: { 
                document_type: 'Proof of Bank Account Ownership',
                document_url: 'https://example.com/bank.pdf'
              },
              inserted_at: '2024-01-03T00:00:00Z',
              updated_at: '2024-01-04T00:00:00Z',
            },
          ],
          page_info: {
            current_page: 1,
            total_pages: 1,
            total_entries: 3,
            page_size: 25,
          },
        },
      };

      sdk.kyc['client'].get = jest.fn().mockResolvedValue(mockResponse);

      const result = await sdk.kyc.getRequirementsStatus('personal');

      expect(result.state).toBe('ok');
      expect(result.result).toBeDefined();

      const status = result.result!;
      
      // Check that statuses were properly converted
      const idDoc = status.document_statuses.find(d => d.document_type === 'Proof of Identity');
      const addressDoc = status.document_statuses.find(d => d.document_type === 'Proof of Address');
      const bankDoc = status.document_statuses.find(d => d.document_type === 'Proof of Bank Account Ownership');

      // Both 'pending' (1) and 'in_review' (2) should map to 'pending'
      expect(idDoc?.status).toBe('pending');
      expect(addressDoc?.status).toBe('pending');
      
      // 'approved' (3) should map to 'approved'
      expect(bankDoc?.status).toBe('approved');
      
      // Check statistics
      expect(status.total_submitted).toBe(3);
      expect(status.total_approved).toBe(1);
      expect(status.total_pending).toBe(2);
      expect(status.total_rejected).toBe(0);
    });

    test('should handle rejected status (4) correctly', async () => {
      const mockResponse = {
        state: 'ok' as const,
        result: {
          entries: [
            {
              id: 1,
              kind: 1,
              status: 4, // rejected (integer from API)
              data: { 
                document_type: 'Proof of Identity',
                document_url: 'https://example.com/id.pdf',
                rejection_reason: 'Document expired'
              },
              inserted_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
            },
          ],
          page_info: {
            current_page: 1,
            total_pages: 1,
            total_entries: 1,
            page_size: 25,
          },
        },
      };

      sdk.kyc['client'].get = jest.fn().mockResolvedValue(mockResponse);

      const result = await sdk.kyc.getRequirementsStatus('personal');
      
      const idDoc = result.result!.document_statuses.find(d => d.document_type === 'Proof of Identity');
      
      expect(idDoc?.status).toBe('rejected');
      expect(idDoc?.rejection_reason).toBe('Document expired');
      expect(result.result!.total_rejected).toBe(1);
    });
  });
});
