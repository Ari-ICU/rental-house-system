import { Bill } from "@/types/bill";
import { formatKhmerDate } from "@/utils/dateFormatter";

// Utility to escape HTML (prevent XSS)
const escapeHtml = (str: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, (s) => map[s]);
};

// Generate bill HTML content
const generateBillHtml = (bill: Bill, lang: "en" | "km", signatureSrc?: string): string => {
  const rentAmount = bill.rental?.rentAmount || 0;
  const electricityAmount = bill.electricityAmount || 0;
  const waterAmount = bill.waterAmount || 0;
  const totalAmount = rentAmount + electricityAmount + waterAmount;

  const clientName = escapeHtml(bill.rental?.ClientName || "N/A");
  const billingMonth = formatKhmerDate(bill.month, lang);
  const printedDate = formatKhmerDate(new Date().toISOString(), lang);

  const translations = {
    en: {
      company: "Xander Rentals",
      address: "123 Main St, Phnom Penh",
      contact: "Tel: +855 12 345 678",
      client: "Client",
      month: "Billing Month",
      room: "Room Rent",
      room1: "Room Number",
      electricity: "Electricity",
      water: "Water",
      total: "TOTAL",
      footer: "Thank you!",
      printed: "Printed on",
      signature: "Signature",
      note: "Please make payment before the due date to avoid penalties."
    },
    km: {
      company: "ក្រុមហ៊ុន Xander",
      address: "១២៣ ផ្លូវមេន, ភ្នំពេញ",
      contact: "ទូរសព្ទ៖ +855 12 345 678",
      client: "អតិថិជន",
      month: "ខែគិតប្រាក់",
      room: "ថ្លៃបន្ទប់",
      room1: "លេខបន្ទប់",
      electricity: "ថ្លៃអគ្គិសនី",
      water: "ទឹក",
      total: "សរុប",
      footer: "សូមអរគុណ!",
      printed: "បោះពុម្ពនៅ",
      signature: "ហត្ថលេខា",
      note: "សូមបង់ប្រាក់មុនថ្ងៃផុតកំណត់ ដើម្បីជៀសវាងការផាកពិន័យ។"
    },
  };

  const t = translations[lang];
  const isKhmer = lang === "km";

  const formatLineAmount = (amount: number, status?: string): string => {
    let str = `$${amount.toFixed(2)}`;
    if (status) str += ` (${escapeHtml(status)})`;
    return str;
  };

  const signatureHtml = signatureSrc ? 
    `<img src="${escapeHtml(signatureSrc)}" alt="Signature" style="width: 80px; height: auto; vertical-align: middle;" />` :
    '<div class="signature-line"></div>';

  return `
  <!DOCTYPE html>
  <html lang="${isKhmer ? "km" : "en"}">
  <head>
    <meta charset="UTF-8" />
    <title>${t.company} - ${t.total}</title>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:400,600&family=Noto+Sans+Khmer:wght@400;600&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>
      @page {
        size: 80mm 135mm;
        margin: 2mm;
      }
      body {
        width: 90mm;
        margin: 0 auto;
        padding: 6mm 5mm;
        font-family: ${isKhmer 
          ? "'Noto Sans Khmer', 'Khmer OS', sans-serif" 
          : "'Noto Sans', Arial, sans-serif"};
        font-size: 10pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
      }
      .center { text-align: center; }
      .bold { font-weight: 600; }

      /* Header */
      .company {
        font-size: 12pt;
        margin-bottom: 2px;
        text-transform: uppercase;
      }
      .address, .contact {
        font-size: 8.5pt;
        color: #555;
        margin: 1px 0;
      }
      .divider {
        border-bottom: 1px dotted #999;
        margin: 8px 0;
      }

      /* Content */
      .line {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }
      .label {
        flex: 1;
        ${isKhmer ? "padding-right: 6px;" : "padding-left: 6px;"}
      }
      .amount {
        font-family: 'IBM Plex Mono', monospace;
        font-weight: 600;
        white-space: nowrap;
      }

      /* Total */
      .total-line {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px dashed #666;
      }
      .total-label {
        font-size: 10pt;
        text-transform: uppercase;
      }
      .total-amount {
        font-size: 11pt;
      }

      /* Notes */
      .note-section {
        margin-top: 10px;
        padding: 6px;
        background: #f5f5f5;
        border-radius: 6px;
        font-size: 8.5pt;
        color: #444;
      }

      /* Signature */
      .signature-section {
        margin-top: 20px;
        text-align: right;
        font-size: 9pt;
      }
      .signature-line {
        border-bottom: 1px dotted #999;
        width: 80px;
        margin-left: auto;
        margin-bottom: 4px;
      }

      /* Footer */
      .footer {
        margin-top: 25px;
        font-size: 8.5pt;
        color: #666;
      }

      @media print {
        body { padding: 6mm 5mm; width: 70mm; }
        img { max-width: 100%; height: auto; }
      }
    </style>
  </head>
  <body>
    <div class="center">
      <div class="bold company">${t.company}</div>
      <div class="address">${t.address}</div>
      <div class="contact">${t.contact}</div>
    </div>

    <div class="divider"></div>

    <div class="line">
      <span class="label">${t.client}:</span>
      <span>${clientName}</span>
    </div>
    <div class="line">
      <span class="label">${t.month}:</span>
      <span>${billingMonth}</span>
    </div>
    <div class="line">
      <span class="label">${t.room1}</span>
      <span>${escapeHtml(bill.rental?.roomNumber || "N/A")}</span>
    </div>

    <div class="divider"></div>

    <div class="line">
      <span class="label">${t.room}</span>
      <span class="amount">$${rentAmount.toFixed(2)}</span>
    </div>
    <div class="line">
      <span class="label">${t.electricity}</span>
      <span class="amount">${formatLineAmount(electricityAmount, bill.electricityStatus)}</span>
    </div>
    <div class="line">
      <span class="label">${t.water}</span>
      <span class="amount">${formatLineAmount(waterAmount, bill.waterStatus)}</span>
    </div>

    <div class="total-line center">
      <div class="line">
        <span class="total-label bold">${t.total}</span>
        <span class="total-amount amount">$${totalAmount.toFixed(2)}</span>
      </div>
    </div>

    <div class="note-section">
      <strong>${isKhmer ? "កំណត់សម្គាល់" : "Note"}:</strong> ${t.note}
    </div>

    <div class="signature-section">
      ${signatureHtml}
      <div>${t.signature}</div>
    </div>

    <div class="footer center">
      <div>${t.footer}</div>
      <div style="margin-top: 4px;">${t.printed}: ${printedDate}</div>
    </div>
  </body>
  </html>`;
};

// Export main print function
export const printBill = (bill: Bill, lang: "en" | "km" = "en", signatureSrc?: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Failed to open print window. Popup may be blocked.");
    return;
  }

  const html = generateBillHtml(bill, lang, signatureSrc);
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener("load", () => {
    printWindow.print();
  });
};