import { jsPDF } from 'jspdf';
import { stateLabels } from './enums';
import { formatPrice, formatTimestamp, shortenAddress } from './format';
import type { Product, ProductTransaction } from '../types/contract';

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportProductCsv(product: Product, history: readonly ProductTransaction[]) {
  const rows: string[][] = [
    ['Field', 'Value'],
    ['ID', product.id.toString()],
    ['Name', product.name],
    ['Category', product.category],
    ['Origin', product.origin],
    ['State', stateLabels[product.currentState]],
    ['Organic', product.isOrganic ? 'Yes' : 'No'],
    ['Price', formatPrice(product.price)],
    ['Batch', product.batchNumber],
    [],
    ['Date', 'State', 'From', 'To', 'Location', 'Notes'],
    ...history.map((t) => [
      formatTimestamp(t.timestamp),
      stateLabels[t.newState],
      t.from,
      t.to,
      t.location,
      t.notes,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  download(`product-${product.id}.csv`, csv, 'text/csv');
}

export function exportProductPdf(product: Product, history: readonly ProductTransaction[]) {
  const doc = new jsPDF();
  let y = 16;
  doc.setFontSize(16);
  doc.text(`Product #${product.id} — ${product.name}`, 14, y);
  y += 10;

  doc.setFontSize(11);
  const fields = [
    `Category: ${product.category}`,
    `Origin: ${product.origin}`,
    `State: ${stateLabels[product.currentState]}`,
    `Organic: ${product.isOrganic ? 'Yes' : 'No'}`,
    `Price: ${formatPrice(product.price)}`,
    `Batch: ${product.batchNumber}`,
    `Harvested: ${formatTimestamp(product.harvestDate)}`,
    `Expires: ${formatTimestamp(product.expiryDate)}`,
  ];
  for (const f of fields) {
    doc.text(f, 14, y);
    y += 7;
  }

  y += 4;
  doc.setFontSize(13);
  doc.text('History', 14, y);
  y += 8;
  doc.setFontSize(10);
  for (const t of history) {
    doc.text(
      `${formatTimestamp(t.timestamp)}  ${stateLabels[t.newState]}  ${shortenAddress(t.from)} -> ${shortenAddress(t.to)}  ${t.location}`,
      14,
      y,
    );
    y += 6;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  }
  doc.save(`product-${product.id}.pdf`);
}
