import { Parser } from "json2csv";
import ExcelJS from "exceljs";

export function normalizeRows(attRows) {
  return attRows.map((a) => ({
    eventId: a.eventId,
    eventTitle: a.event?.title || "",
    participantName: a.participant?.name || "",
    participantEmail: a.participant?.email || "",
    joinedAt: a.joinedAt,
    method: a.method,
  }));
}

export function makeCsv(rows) {
  const parser = new Parser({
    fields: ["eventId", "eventTitle", "participantName", "participantEmail", "joinedAt", "method"],
  });
  return parser.parse(rows);
}

export async function makeXlsx(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Attendance");

  ws.columns = [
    { header: "Event ID", key: "eventId", width: 10 },
    { header: "Event Title", key: "eventTitle", width: 24 },
    { header: "Name", key: "participantName", width: 22 },
    { header: "Email", key: "participantEmail", width: 28 },
    { header: "Joined At", key: "joinedAt", width: 26 },
    { header: "Method", key: "method", width: 10 },
  ];

  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));

  return wb.xlsx.writeBuffer();
}
