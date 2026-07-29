export interface ProductLineItem {
  productId: string;
  unitPrice: number;
  quantity: number;
  gstRate: number; // e.g., 0, 5, 12, 18, 28
}

export interface CalculatedLineItem extends ProductLineItem {
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
}

export interface InvoiceCalculationResult {
  lineItems: CalculatedLineItem[];
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  grandTotal: number;
  isInterState: boolean;
}

/**
 * Calculates GST for an invoice based on intra/inter-state rules.
 * @param items Array of product line items
 * @param businessState The 2-digit GST state code of the business
 * @param customerBillingState The 2-digit GST state code of the customer
 * @returns InvoiceCalculationResult with full breakdown
 */
export const calculateInvoiceGST = (
  items: ProductLineItem[],
  businessState: string,
  customerBillingState: string
): InvoiceCalculationResult => {
  const isInterState = businessState !== customerBillingState;

  let subtotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  const lineItems: CalculatedLineItem[] = items.map((item) => {
    const taxableValue = item.unitPrice * item.quantity;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstAmount = (taxableValue * item.gstRate) / 100;
    } else {
      cgstAmount = (taxableValue * (item.gstRate / 2)) / 100;
      sgstAmount = (taxableValue * (item.gstRate / 2)) / 100;
    }

    const lineTotal = taxableValue + cgstAmount + sgstAmount + igstAmount;

    subtotal += taxableValue;
    totalCGST += cgstAmount;
    totalSGST += sgstAmount;
    totalIGST += igstAmount;

    return {
      ...item,
      taxableValue,
      cgstAmount,
      sgstAmount,
      igstAmount,
      lineTotal,
    };
  });

  return {
    lineItems,
    subtotal,
    totalCGST,
    totalSGST,
    totalIGST,
    grandTotal: subtotal + totalCGST + totalSGST + totalIGST,
    isInterState,
  };
};
