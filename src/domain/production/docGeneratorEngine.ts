import { FROZEN_API_CONTRACTS } from './frozenApiContracts';
import { FROZEN_PRODUCTION_SCHEMA, FROZEN_ERD_PLANTUML } from './frozenDatabaseSchema';
import { PRODUCTION_CLOSEOUT_DOCUMENTATION, DocItem } from './productionDocumentation';

export class EnterpriseDocGeneratorEngine {
  public getFrozenApiContracts() {
    return FROZEN_API_CONTRACTS;
  }

  public getFrozenDatabaseSchema() {
    return FROZEN_PRODUCTION_SCHEMA;
  }

  public getErdPlantUml(): string {
    return FROZEN_ERD_PLANTUML;
  }

  public getAllDocumentation(): DocItem[] {
    return PRODUCTION_CLOSEOUT_DOCUMENTATION;
  }

  public getDocByCategory(category: DocItem['category']): DocItem[] {
    return PRODUCTION_CLOSEOUT_DOCUMENTATION.filter(d => d.category === category);
  }

  public generateOpenApiSpec(): string {
    const restContract = FROZEN_API_CONTRACTS.find(c => c.protocol === 'REST');
    return restContract ? restContract.schemaDefinition : JSON.stringify({
      openapi: '3.1.0',
      info: {
        title: 'OmniPOS Enterprise Restaurant Platform REST API',
        version: '1.0.0-GA',
        description: 'Complete API documentation for POS Checkout, Procurement, 3-Way Matching, KDS, ZATCA Phase 2, Franchise Royalty, and Delivery Fleet.',
        contact: { name: 'Enterprise API Architecture Team', email: 'api-support@omnipos.sa' },
      },
      servers: [
        { url: 'https://api.omnipos.sa/v1', description: 'Production Multi-Region Cluster' },
        { url: 'https://staging-api.omnipos.sa/v1', description: 'Staging Environment' },
      ],
      paths: {
        '/orders/checkout': {
          post: {
            summary: 'Process POS Order Checkout and Issue ZATCA E-Invoice',
            operationId: 'checkoutOrder',
            responses: {
              '200': { description: 'Order completed, invoice signed by ZATCA CSID, QR generated.' },
            }
          }
        }
      }
    }, null, 2);
  }

  public generateAsyncApiSpec(): string {
    const asyncContract = FROZEN_API_CONTRACTS.find(c => c.protocol === 'AsyncAPI');
    return asyncContract ? asyncContract.schemaDefinition : JSON.stringify({
      asyncapi: '3.0.0',
      info: {
        title: 'OmniPOS Distributed Event Streams & Real-Time WebSockets',
        version: '1.0.0-GA',
      }
    }, null, 2);
  }

  public generateErdSchema(): string {
    return FROZEN_ERD_PLANTUML;
  }

  public generateRunbookSev1(): string {
    const opDoc = PRODUCTION_CLOSEOUT_DOCUMENTATION.find(d => d.id === 'OPERATIONS_MANUAL');
    return opDoc ? opDoc.contentMarkdown : `# Enterprise Production Runbook: SEV-1 Incident Response`;
  }
}

export const docGeneratorEngine = new EnterpriseDocGeneratorEngine();

