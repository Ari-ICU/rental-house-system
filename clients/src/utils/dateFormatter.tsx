export function formatKhmerDate(dateStr?: string, lang: "en" | "km" = "en"): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    if (lang === "km") {
        try {
            // Try native Khmer locale support first
            const khDate = date.toLocaleDateString("km-KH", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });

            // Check if it actually localized (some browsers fallback to English)
            if (/[A-Za-z]/.test(khDate)) throw new Error("Locale not applied");

            return khDate;
        } catch {
            // Manual fallback to Khmer digits and months
            const khMonths = [
                "មករា", "កម្ភៈ", "មិនា", "មេសា", "ឧសភា", "មិថុនា",
                "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
            ];
            const day = date.getDate().toString().padStart(2, "0");
            const month = khMonths[date.getMonth()];
            const year = date.getFullYear().toString();
            const toKhmerDigits = (num: string) =>
                num.replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[+d]);

            return `${toKhmerDigits(day)} ${month} ${toKhmerDigits(year)}`;
        }
    }

    // Default English format
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}