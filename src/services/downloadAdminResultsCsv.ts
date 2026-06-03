import type { AdminTestResult } from "./getAdminResults";

function formatLevel(level: "bachelor" | "master") {
  return level === "bachelor" ? "Бакалавриат" : "Магистратура";
}

function escapeCsvValue(value: string | number | null | undefined): string {
  const stringValue = value === null || value === undefined ? "" : String(value);

  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function downloadAdminResultsCsv(results: AdminTestResult[]) {
  const headers = [
    "ID",
    "Дата",
    "Уровень",
    "Лучший профиль",
    "Совпадение",
  ];

  const rows = results.map((result) => [
    result.id,
    new Date(result.created_at).toLocaleString("ru-RU"),
    formatLevel(result.education_level),
    result.top_program_name ?? "",
    result.top_program_percent ?? "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `admin-test-results-${Date.now()}.csv`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}