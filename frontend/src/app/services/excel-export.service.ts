import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { DashboardRow } from '../core/models/dashboard-row.model';
import { FundTotals } from '../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  exportFundReport(
    rows: DashboardRow[],
    monthLabel: string,
    overallTotals: FundTotals | null
  ): void {
    const sheetData: (string | number)[][] = [['Date', 'Name', 'Credit', 'Debit']];

    for (const row of rows) {
      const dateStr = row.date
        ? new Date(row.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '—';
      sheetData.push([dateStr, row.customer.name, row.creditAmount, row.debitAmount]);
    }

    const monthCredit = rows.reduce((s, r) => s + r.creditAmount, 0);
    const monthDebit = rows.reduce((s, r) => s + r.debitAmount, 0);
    const monthFund = monthCredit - monthDebit;

    sheetData.push([]);
    sheetData.push(['', `Month Summary — ${monthLabel}`, '', '']);
    sheetData.push(['Total Credit', '', monthCredit, '']);
    sheetData.push(['Total Debit', '', monthDebit, '']);
    sheetData.push(['Total Fund', '', monthFund, '']);

    if (overallTotals) {
      sheetData.push([]);
      sheetData.push(['', 'Overall Fund Summary (All Time)', '', '']);
      sheetData.push(['Total Credit', '', overallTotals.totalCredit, '']);
      sheetData.push(['Total Debit', '', overallTotals.totalDebit, '']);
      sheetData.push(['Total Fund', '', overallTotals.totalFund, '']);
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 14 }];

    const wb = XLSX.utils.book_new();
    const sheetName = monthLabel.replace(/\s*-\s*/g, ' ').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fileName = `Fund_${monthLabel.replace(/\s*-\s*/g, '-').replace(/\s+/g, '')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}
