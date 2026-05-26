export const FIELD_DEFINITIONS: Record<string, string[]> = {
  POLYTAINER_INVOICE: [
    'Invoice Number', 'Invoice Date', 'Customer PO Number', 'Delivery Order Number',
    'Product Code', 'Product Description', 'Quantity (PCS)', 'Number of Pallets',
    'Unit Price', 'Amount (USD)', 'Total Amount', 'Payment Terms',
    'Empty Pallets to Return', 'Weight (KGS)',
  ],
  SSS_INVOICE: [
    'Invoice Number', 'Invoice Date', 'Delivery Order Number', 'Account Number',
    'Customer PO Number', 'Item Number', 'Product Description', 'UOM',
    'Quantity (MT)', 'Unit Price (USD)', 'Tax Code', 'Tax %',
    'Total (USD)', 'Total Before Sales Tax', 'Sales Tax Amount', 'Total After Sales Tax',
    'Payment Terms', 'Salesperson', 'Isotank Return Note',
    'Bank Name', 'Bank Account Number', 'Bank Swift Code',
  ],
  DDW_INVOICE: [
    'Invoice Number', 'Invoice Date', 'Customer PO Number', 'Order Number',
    'Item Number', 'Product Description', 'HS Code', 'Billing Quantity (KG)',
    'Unit Price (USD)', 'Extended Price', 'Payment Terms', 'Net Due Date',
    'Bank Name', 'Bank Account Number', 'Bank Swift Code',
  ],
  DDW_PACK_SLIP: [
    'Slip Number', 'Date', 'Customer PO Number', 'Order Number',
    'Ship Date', 'ETA Date', 'Line Number', 'Quantity Ordered (KG)',
    'Item Number', 'Item Description', 'Container ID', 'Seal Numbers',
    'Lot Number', 'Delivery Instructions',
  ],
  DDW_COA: [
    'DDW Item Number', 'Product Name', 'Package Lot Number', 'Customer Purchase Order',
    'Order Number', 'Quantity Shipped (KG)', 'Date Shipped', 'Container ID',
    'Manufactured Location', 'Manufactured Date', 'Lot Expiration Date',
  ],
  DDW_DELIVERY_DOCKET: [
    'Slip Number', 'Date', 'Customer PO Number', 'Order Date',
    'Promised Ship Date', 'Item Description', 'Net Quantity (KG)',
    'Container ID', 'Location (tank)', 'Lot Number', 'Delivery Instructions',
  ],
};
