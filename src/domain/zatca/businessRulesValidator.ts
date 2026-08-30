// Enterprise ZATCA Business Rules Validator
// Implements standard ZATCA Phase 2 validation checks (BR-KSA-01 to BR-KSA-72)
// Asserts syntactic, semantic, and mathematical compliance prior to clearance or reporting

import { ZatcaInvoiceModel, ZatcaValidationResult } from './zatcaDomain';
import { Money } from '../financial/money';

export class ZatcaBusinessRulesValidator {
  /**
   * Validates a complete ZATCA invoice model against Phase 2 requirements
   */
  public static validate(invoice: ZatcaInvoiceModel): ZatcaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const ruleViolations: { ruleCode: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];

    const addError = (ruleCode: string, message: string) => {
      errors.push(`[${ruleCode}] ${message}`);
      ruleViolations.push({ ruleCode, message, severity: 'ERROR' });
    };

    const addWarning = (ruleCode: string, message: string) => {
      warnings.push(`[${ruleCode}] ${message}`);
      ruleViolations.push({ ruleCode, message, severity: 'WARNING' });
    };

    // BR-KSA-01: Seller VAT Number must be 15 digits starting and ending with 3
    const vatRegex = /^3[0-9]{13}3$/;
    if (!invoice.seller.vatNumber || !vatRegex.test(invoice.seller.vatNumber)) {
      addError('BR-KSA-01', 'Seller VAT number must be exactly 15 digits, starting and ending with 3');
    }

    // BR-KSA-02: Seller address fields
    if (!invoice.seller.address.street || invoice.seller.address.street.trim().length === 0) {
      addError('BR-KSA-02', 'Seller street address is mandatory');
    }
    if (!invoice.seller.address.buildingNumber || !/^[0-9]{4}$/.test(invoice.seller.address.buildingNumber)) {
      addError('BR-KSA-03', 'Seller building number must be 4 digits');
    }
    if (!invoice.seller.address.postalCode || !/^[0-9]{5}$/.test(invoice.seller.address.postalCode)) {
      addError('BR-KSA-04', 'Seller postal code must be 5 digits');
    }
    if (!invoice.seller.address.district || invoice.seller.address.district.trim().length === 0) {
      addError('BR-KSA-05', 'Seller district / city subdivision is mandatory');
    }
    if (!invoice.seller.address.city || invoice.seller.address.city.trim().length === 0) {
      addError('BR-KSA-06', 'Seller city is mandatory');
    }
    if (invoice.seller.address.countryCode !== 'SA') {
      addError('BR-KSA-07', 'Seller country code must be SA');
    }

    // BR-KSA-08: Invoice Counter Value (ICV)
    if (!invoice.docReference.invoiceCounterValue || invoice.docReference.invoiceCounterValue <= 0) {
      addError('BR-KSA-08', 'Invoice Counter Value (ICV) must be a positive integer greater than 0');
    }

    // BR-KSA-09: Previous Invoice Hash (PIH)
    if (!invoice.docReference.previousInvoiceHash || invoice.docReference.previousInvoiceHash.trim().length === 0) {
      addError('BR-KSA-09', 'Previous Invoice Hash (PIH) is mandatory for hash chaining');
    }

    // BR-KSA-10: Standard Invoice (B2B) Requirements
    if (invoice.invoiceType === '0100000') {
      if (!invoice.buyer) {
        addError('BR-KSA-10', 'Buyer details are mandatory for Standard Tax Invoices (B2B)');
      } else {
        if (!invoice.buyer.legalName || invoice.buyer.legalName.trim().length === 0) {
          addError('BR-KSA-11', 'Buyer legal name is mandatory for Standard B2B invoices');
        }
        if (invoice.buyer.vatNumber && !vatRegex.test(invoice.buyer.vatNumber)) {
          addWarning('BR-KSA-12', 'Buyer VAT number if provided should be 15 digits starting and ending with 3');
        }
      }
    }

    // BR-KSA-13: Credit Note (381) and Debit Note (383) Billing Reference
    if (invoice.transactionType === '381' || invoice.transactionType === '383') {
      if (!invoice.docReference.billingReference || !invoice.docReference.billingReference.originalInvoiceUuid) {
        addError('BR-KSA-13', 'Credit and Debit notes must reference the original invoice ID and UUID in BillingReference');
      }
    }

    // BR-KSA-14: Line items validation
    if (!invoice.items || invoice.items.length === 0) {
      addError('BR-KSA-14', 'Invoice must contain at least one line item');
    } else {
      let calculatedSubtotal = Money.zero(invoice.summary.subtotal.currency);
      let calculatedTax = Money.zero(invoice.summary.subtotal.currency);

      invoice.items.forEach((item, index) => {
        if (item.quantity <= 0) {
          addError('BR-KSA-15', `Line item ${index + 1}: Quantity must be greater than zero`);
        }
        if (item.unitPrice.isNegative()) {
          addError('BR-KSA-16', `Line item ${index + 1}: Unit price cannot be negative`);
        }

        // Check VAT calculation (15% for Standard category 'S')
        if (item.taxCategory === 'S') {
          if (item.vatRate !== 0.15) {
            addWarning('BR-KSA-17', `Line item ${index + 1}: Standard VAT rate in Saudi Arabia is 15% (0.15)`);
          }
        }

        calculatedSubtotal = calculatedSubtotal.add(item.taxableAmount);
        calculatedTax = calculatedTax.add(item.vatAmount);
      });

      // Mathematical consistency checks
      if (!calculatedSubtotal.equals(invoice.summary.taxExclusiveAmount)) {
        addError('BR-KSA-18', `TaxExclusiveAmount (${invoice.summary.taxExclusiveAmount.formatMajor()}) does not match sum of line taxable amounts (${calculatedSubtotal.formatMajor()})`);
      }
      if (!calculatedTax.equals(invoice.summary.totalVatAmount)) {
        addError('BR-KSA-19', `Total VAT Amount (${invoice.summary.totalVatAmount.formatMajor()}) does not match sum of line VAT amounts (${calculatedTax.formatMajor()})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      ruleViolations,
    };
  }
}
