import { getTypeHelperText } from "../utils/priceBookHelpers";
import type { PriceBook } from "../types";

export function buildPriceBookSummary(book: PriceBook): string {
  const lines = [
    `Name: ${book.name}`,
    `Code: ${book.code}`,
    `Type: ${book.type}`,
    `Currency: ${book.currency}`,
    `Status: ${book.isActive ? "active" : "inactive"}`,
  ];

  if (book.validFrom) {
    lines.push(`Valid from: ${new Date(book.validFrom).toISOString()}`);
  }
  if (book.validTo) {
    lines.push(`Valid to: ${new Date(book.validTo).toISOString()}`);
  } else if (book.validFrom) {
    lines.push("Valid to: open-ended");
  } else {
    lines.push("Validity: always applicable");
  }

  const typeHelp = getTypeHelperText(book.type);
  if (typeHelp?.text) {
    lines.push("", `Type behavior: ${typeHelp.text}`);
  }

  return lines.join("\n");
}

export function buildCatalogSummary(books: PriceBook[], focusBookId: string): string {
  const others = books.filter((book) => book.id !== focusBookId);
  if (!others.length) return "";

  return others
    .map(
      (book) =>
        `- ${book.name} (${book.code}): ${book.type}, ${book.currency}, ${
          book.isActive ? "active" : "inactive"
        }`,
    )
    .join("\n");
}

export function buildPriceBookRationalePayload(book: PriceBook, allBooks: PriceBook[]) {
  return {
    priceBookSummary: buildPriceBookSummary(book),
    catalogSummary: buildCatalogSummary(allBooks, book.id) || undefined,
  };
}
