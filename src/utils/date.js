/**
 * Helper utilitas penanganan waktu & tanggal real-time Indonesia (WIB / Asia/Jakarta / UTC+7)
 * Memastikan semua invoice, laporan, dan filter tanggal sinkron dengan waktu lokal Indonesia.
 */

// Mendapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai waktu WIB
const getTodayDateStringWIB = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // Output: "YYYY-MM-DD"
};

// Mendapatkan string tanggal format YYYYMMDD untuk nomor invoice kasir POS (contoh: "20260915")
const getInvoiceDateStringWIB = () => {
  return getTodayDateStringWIB().replace(/-/g, '');
};

// Mendapatkan awal hari (00:00:00.000 WIB)
const getStartOfDayWIB = (dateStr = null) => {
  const targetDateStr = dateStr || getTodayDateStringWIB();
  return new Date(`${targetDateStr}T00:00:00+07:00`);
};

// Mendapatkan akhir hari (23:59:59.999 WIB)
const getEndOfDayWIB = (dateStr = null) => {
  const targetDateStr = dateStr || getTodayDateStringWIB();
  return new Date(`${targetDateStr}T23:59:59.999+07:00`);
};

// Mendapatkan awal bulan (00:00:00.000 WIB tanggal 1)
const getStartOfMonthWIB = () => {
  const todayStr = getTodayDateStringWIB();
  const yearMonth = todayStr.slice(0, 7);
  return new Date(`${yearMonth}-01T00:00:00+07:00`);
};

/**
 * Parsing rentang tanggal start_date dan end_date ke zona waktu WIB (+07:00)
 */
const parseDateRange = (startDateStr, endDateStr) => {
  let startDate = null;
  let endDate = null;

  if (startDateStr) {
    const trimmed = String(startDateStr).trim();
    if (trimmed.length === 10) {
      startDate = new Date(`${trimmed}T00:00:00+07:00`);
    } else {
      startDate = new Date(trimmed);
    }
  }

  if (endDateStr) {
    const trimmed = String(endDateStr).trim();
    if (trimmed.length === 10) {
      endDate = new Date(`${trimmed}T23:59:59.999+07:00`);
    } else {
      endDate = new Date(trimmed);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  return { startDate, endDate };
};

module.exports = {
  getTodayDateStringWIB,
  getInvoiceDateStringWIB,
  getStartOfDayWIB,
  getEndOfDayWIB,
  getStartOfMonthWIB,
  parseDateRange
};
