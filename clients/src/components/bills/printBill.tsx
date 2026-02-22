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
const generateBillHtml = (bill: Bill, lang: "en" | "km", exchangeRate: number = 4100, signatureSrc?: string): string => {
  const rentAmount = bill.rentAmount ?? bill.rental?.rentAmount ?? 0;
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
        margin: 0;
      }
      body {
        margin: 0;
        padding: 4mm 2mm;
        width: 76mm;
        font-family: ${isKhmer ? "'Noto Sans Khmer', 'Khmer OS', sans-serif" : "'Noto Sans', Arial, sans-serif"};
        font-size: 8.5pt;
        line-height: 1.4;
        color: #000;
        background: #fff;
      }
      .center { text-align: center; }
      .bold { font-weight: 600; }

      /* Header */
      .company {
        font-size: 11pt;
        margin-bottom: 2px;
        text-transform: uppercase;
      }
      .address, .contact {
        font-size: 8pt;
        color: #333;
        margin: 1px 0;
      }
      .divider {
        border-bottom: 1px dashed #666;
        margin: 6px 0;
      }

      /* Content */
      .line {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
      }
      .label {
        flex: 1;
        ${isKhmer ? "padding-right: 4px;" : "padding-left: 4px;"}
      }
      .amount {
        font-family: 'IBM Plex Mono', monospace;
        font-weight: 600;
        white-space: nowrap;
      }

      /* Total */
      .total-line {
        margin-top: 6px;
        padding-top: 4px;
        border-top: 1px dashed #333;
      }
      .total-label {
        font-size: 9pt;
        text-transform: uppercase;
      }
      .total-amount {
        font-size: 10pt;
      }

      /* Notes */
      .note-section {
        margin-top: 8px;
        padding: 4px;
        background: #f9f9f9;
        border-radius: 4px;
        font-size: 8pt;
        color: #333;
      }

      /* Signature */
      .signature-section {
        margin-top: 15px;
        margin-bottom: 5px;
        text-align: right;
        font-size: 8pt;
        page-break-inside: avoid;
      }
      .signature-line {
        border-bottom: 1px dotted #666;
        width: 70px;
        margin-left: auto;
        margin-bottom: 4px;
      }

      /* Footer */
      .footer {
        margin-top: 12px;
        font-size: 8pt;
        color: #444;
        page-break-inside: avoid;
      }

      @media print {
        @page { margin: 0; }
        body { margin: 0; padding: 4mm 2mm; width: 76mm; }
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
      <span class="label">${t.electricity}
        ${bill.prevElectricityReading !== undefined ? `<br/><small style="font-size:7pt; color:#666">${bill.prevElectricityReading} → ${bill.currElectricityReading}</small>` : ''}
      </span>
      <span class="amount">${formatLineAmount(electricityAmount, bill.electricityStatus)}</span>
    </div>
    <div class="line">
      <span class="label">${t.water}
        ${bill.prevWaterReading !== undefined ? `<br/><small style="font-size:7pt; color:#666">${bill.prevWaterReading} → ${bill.currWaterReading}</small>` : ''}
      </span>
      <span class="amount">${formatLineAmount(waterAmount, bill.waterStatus)}</span>
    </div>

    <div class="total-line centre">
      <div class="line">
        <span class="total-label bold">${t.total} (USD)</span>
        <span class="total-amount amount">$${totalAmount.toFixed(2)}</span>
      </div>
      <div class="line" style="margin-top: 2px;">
        <span class="total-label bold">${isKhmer ? 'សរុបជាប្រាក់រៀល' : 'Total (KHR)'}</span>
        <span class="total-amount amount">${Math.round(totalAmount * exchangeRate).toLocaleString()} ៛</span>
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
export const printBill = (bill: Bill, lang: "en" | "km" = "en", exchangeRate: number = 4100, signatureSrc?: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Failed to open print window. Popup may be blocked.");
    return;
  }

  const html = generateBillHtml(bill, lang, exchangeRate, signatureSrc);
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener("load", () => {
    printWindow.print();
  });
};