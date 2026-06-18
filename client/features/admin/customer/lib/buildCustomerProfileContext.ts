import type { User } from "../type";

export function buildCustomerSummary(user: User): string {
  const lines = [
    `Customer ID: ${user.id}`,
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    `Username: ${user.username}`,
    `Status: ${user.status}`,
    `Joined: ${new Date(user.createdAt).toISOString()}`,
  ];

  if (user.phone) lines.push(`Phone: ${user.phone}`);
  if (user.companyName) lines.push(`Company: ${user.companyName}`);
  if (user.customerCode) lines.push(`Customer code: ${user.customerCode}`);
  if (user.taxId) lines.push(`Tax ID: ${user.taxId}`);
  if (user.creditLimit != null && Number(user.creditLimit) > 0) {
    lines.push(`Credit limit: ${user.creditLimit}`);
  }
  if (user.creditHold) lines.push("Credit hold: yes");
  if (user.priceBookCode) lines.push(`Price book: ${user.priceBookCode}`);
  if (user.preferredBranchId) lines.push(`Preferred branch: ${user.preferredBranchId}`);

  return lines.join("\n");
}

export function buildOrdersSummary(orders: Array<Record<string, unknown>>): string {
  if (!orders.length) return "";

  const totalSpend = orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
  const lines = [
    `Recent orders: ${orders.length}`,
    `Recent spend total: ${totalSpend.toFixed(2)}`,
    "",
    ...orders.slice(0, 8).map((order) => {
      const id = String(order.id ?? "").slice(-8).toUpperCase();
      const parts = [
        `#${id}`,
        order.status ? `status=${order.status}` : null,
        order.paymentStatus ? `payment=${order.paymentStatus}` : null,
        order.totalAmount != null ? `total=${order.totalAmount}` : null,
        order.createdAt ? `date=${new Date(String(order.createdAt)).toISOString().slice(0, 10)}` : null,
      ].filter(Boolean);
      return `- ${parts.join(", ")}`;
    }),
  ];

  return lines.join("\n");
}

export function buildReturnsSummary(returns: Array<Record<string, unknown>>): string {
  if (!returns.length) return "";

  return returns
    .slice(0, 5)
    .map((item) => {
      const id = String(item.id ?? "").slice(-8).toUpperCase();
      return `- Return #${id}: status=${item.status ?? "unknown"}, type=${item.returnType ?? "refund"}${
        item.refundAmount != null ? `, refund=${item.refundAmount}` : ""
      }`;
    })
    .join("\n");
}

export function buildWalletSummary(wallet: { balance?: number; history?: Array<{ type?: string; amount?: number }> }): string {
  const lines = [`Current balance: ${wallet.balance ?? 0}`];
  const recent = wallet.history?.slice(0, 3) ?? [];
  if (recent.length) {
    lines.push(
      "Recent transactions:",
      ...recent.map(
        (tx) => `- ${tx.type ?? "txn"}: ${tx.amount ?? 0}`,
      ),
    );
  }
  return lines.join("\n");
}

export function buildLoyaltySummary(
  history: Array<{ points?: number; balanceAfter?: number; type?: string; createdAt?: string }>,
): string {
  if (!history.length) return "";

  const latest = history[0];
  const lines = [`Points balance: ${latest.balanceAfter ?? 0}`];
  lines.push(
    "Recent activity:",
    ...history.slice(0, 5).map(
      (entry) =>
        `- ${entry.type ?? "entry"}: ${entry.points ?? 0} pts (balance ${entry.balanceAfter ?? 0})`,
    ),
  );
  return lines.join("\n");
}
