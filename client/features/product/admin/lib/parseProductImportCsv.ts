export interface ProductImportRow {
  name: string;
  price: number;
  slug?: string;
  description?: string;
  category?: string;
  sku?: string;
  status?: string;
  keywords?: string;
}

export interface ParsedProductImport {
  rows: ProductImportRow[];
  errors: Array<{ line: number; message: string }>;
}

const HEADER_ALIASES: Record<string, keyof ProductImportRow> = {
  name: "name",
  product: "name",
  "product name": "name",
  price: "price",
  slug: "slug",
  description: "description",
  desc: "description",
  category: "category",
  sku: "sku",
  status: "status",
  keywords: "keywords",
  tags: "keywords",
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

export function parseProductImportCsv(text: string): ParsedProductImport {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV must include a header row and at least one product row." }],
    };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const nameIndex = headers.findIndex((header) => HEADER_ALIASES[header] === "name");
  const priceIndex = headers.findIndex((header) => HEADER_ALIASES[header] === "price");

  if (nameIndex < 0 || priceIndex < 0) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV header must include name and price columns." }],
    };
  }

  const rows: ProductImportRow[] = [];
  const errors: ParsedProductImport["errors"] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const lineNumber = lineIndex + 1;
    const cells = parseCsvLine(lines[lineIndex]);
    const row: ProductImportRow = {
      name: "",
      price: 0,
    };

    headers.forEach((header, index) => {
      const field = HEADER_ALIASES[header];
      const value = cells[index]?.trim();
      if (!field || !value) return;
      (row as any)[field] = value;
    });

    if (!row.name) {
      errors.push({ line: lineNumber, message: "Missing product name." });
      continue;
    }

    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push({ line: lineNumber, message: `Invalid price for "${row.name}".` });
      continue;
    }

    rows.push({ ...row, price });
  }

  return { rows, errors };
}

export const PRODUCT_IMPORT_TEMPLATE = `name,price,slug,description,category,sku,status,keywords
Organic Cotton Tee,24.99,organic-cotton-tee,,Apparel,OCT-001,inactive,cotton eco tee
Stainless Water Bottle,18.5,,,Drinkware,SWB-200,inactive,insulated bottle
`;
