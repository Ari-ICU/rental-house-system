import { Bill } from "@/types/bill";
import { formatKhmerDate } from "@/utils/dateFormatter";

// Utility to escape HTML (prevent XSS)
const escapeHtml = (str: string): string => {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "<",
        ">": ">",
        '"': "&quot;",
        "'": "&#039;",
    };
    return str.replace(/[&<>"']/g, (s) => map[s]);
};

// Generate bill HTML content
const generateBillHtml = (bill: Bill, lang: "en" | "km"): string => {
    const rentAmount = bill.rental?.rentAmount || 0;
    const electricityAmount = bill.electricityAmount || 0;
    const waterAmount = bill.waterAmount || 0;
    const totalAmount = rentAmount + electricityAmount + waterAmount;

    const clientName = escapeHtml(bill.rental?.ClientName || "N/A");
    const month = formatKhmerDate(bill.month, lang);
    const printedDate = formatKhmerDate(bill.month, lang);

    const translations = {
        en: {
            title: "Bill",
            subtitle: "Monthly Rental Bill",
            company: "Xander Rentals",
            address: "123 Main Street, Phnom Penh, Cambodia",
            contact: "Phone: +855 12 345 678 | Email: info@xanderrentals.com",
            client: "Client",
            month: "Month",
            roomPrice: "Room Price",
            electricity: "Electricity",
            water: "Water",
            total: "Total",
            footer: "Thank you for your business!",
        },
        km: {
            title: "វិក្កយបត្រ",
            subtitle: "វិក្កយបត្រជួលប្រចាំខែ",
            company: "ក្រុមហ៊ុនជួលបន្ទប់ Xander",
            address: "លេខ 123 ផ្លូវមេន, ភ្នំពេញ, កម្ពុជា",
            contact: "ទូរស័ព្ទ: +855 12 345 678 | អ៊ីមែល: info@xanderrentals.com",
            client: "អតិថិជន",
            month: "ខែ",
            roomPrice: "តម្លៃបន្ទប់",
            electricity: "អគ្គិសនី",
            water: "ទឹក",
            total: "សរុប",
            footer: "សូមអរគុណសម្រាប់ការជួញដូររបស់អ្នក!",
        },
    };

    const t = translations[lang];

    // Helper to format amount with status
    const formatAmount = (amount: number, status?: string): string => {
        let html = `$${amount.toFixed(2)}`;
        if (status) {
            html += ` <span class="status">(${escapeHtml(status)})</span>`;
        }
        return html;
    };

    return `
    <!DOCTYPE html>
    <html lang="${lang === "km" ? "km" : "en"}">
    <head>
      <meta charset="UTF-8" />
      <title>${t.title} - ${clientName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Khmer:wght@400;700&display=swap" rel="stylesheet">
      <style>
       @page {
            size: 110mm 160mm; /* Quarter of A4 */
            margin: 10px;
        }

        body {
          font-family: ${lang === "km" ? "'Noto Sans Khmer', 'Noto Sans', Arial, sans-serif" : "'Noto Sans', Arial, sans-serif"};
          margin: 0;
          padding: 20px;
          background-color: #fff;
          color: #333;
          line-height: 1.5;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        header {
          text-align: center;
          margin-bottom: 24px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 16px;
        }
        h1 {
          margin: 0 0 8px;
          color: #2c3e50;
          font-size: 28px;
          font-weight: 700;
        }
        h2 {
          margin: 0;
          color: #34495e;
          font-size: 18px;
          font-weight: 400;
        }
        .company-info {
          margin-top: 12px;
          font-size: 14px;
          color: #7f8c8d;
        }
        .company-info p {
          margin: 4px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        th {
          background-color: #3498db;
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .amount {
          text-align: right;
          font-weight: 600;
        }
        .total-row {
          border-top: 3px solid #3498db;
        }
        .total-row th,
        .total-row td {
          font-weight: 700;
          font-size: 16px;
          background-color: #ecf0f1;
          color: #2c3e50;
        }
        .status {
          color: #e74c3c;
          font-style: italic;
          font-size: 12px;
        }
        footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #95a5a6;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }
          header, main, footer {
            padding: 0 10px;
          }
          table {
            box-shadow: none;
          }
          h1 { font-size: 24px; }
          h2 { font-size: 16px; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>${t.subtitle}</h1>
          <div class="company-info">
            <p><strong>${t.company}</strong></p>
            <p>${t.address}</p>
            <p>${t.contact}</p>
          </div>
        </header>

        <main>
          <table>
            <tr><th>${t.client}</th><td>${clientName}</td></tr>
            <tr><th>${t.month}</th><td>${month}</td></tr>
            <tr><th>${t.roomPrice}</th><td class="amount">$${rentAmount.toFixed(2)}</td></tr>
            <tr><th>${t.electricity}</th><td class="amount">${formatAmount(electricityAmount, bill.electricityStatus)}</td></tr>
            <tr><th>${t.water}</th><td class="amount">${formatAmount(waterAmount, bill.waterStatus)}</td></tr>
            <tr class="total-row"><th>${t.total}</th><td class="amount">$${totalAmount.toFixed(2)}</td></tr>
          </table>
        </main>

        <footer>
          <p>${t.footer}</p>
          <p>Printed on ${printedDate}</p>
        </footer>
      </div>
    </body>
    </html>
  `;
};

// Main export
export const printBill = (bill: Bill, lang: "en" | "km" = "en") => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        console.error("Failed to open print window. Popup may be blocked.");
        return;
    }

    const html = generateBillHtml(bill, lang);
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for fonts to load before printing (optional but recommended)
    printWindow.addEventListener("load", () => {
        printWindow.print();
    });
};