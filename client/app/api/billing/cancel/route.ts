import { NextRequest, NextResponse } from "next/server";

async function handleCancel(request: NextRequest, data: any = {}) {
  try {
    const tran_id = request.nextUrl.searchParams.get("tran_id") || data.tran_id;

    // Use internal Docker service name for server-side
    const backendUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";

    const storeId = data.value_b;

    await fetch(`${backendUrl}/billing/complete/cancel?tran_id=${tran_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId || "",
      },
      body: JSON.stringify(data),
      redirect: "manual",
    }).catch(() => null);

    // Redirect to UI Cancel Page with correct subdomain
    const host = request.headers.get("host") || request.nextUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${protocol}://${host}`;

    return NextResponse.redirect(`${origin}/admin/settings/billing/cancel?tran_id=${tran_id}`, 303);

  } catch (error) {
    console.error("Billing Cancel Route Error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/admin/settings/billing/fail?error=server_error`, 303);
  }
}

export async function POST(request: NextRequest) {
  const data: any = {};
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => (data[key] = value));
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => (data[key] = value));
    }
  } catch (err) {
    console.error("Failed to parse POST body in cancel route:", err);
  }
  return handleCancel(request, data);
}

export async function GET(request: NextRequest) {
  const data: any = {};
  request.nextUrl.searchParams.forEach((value, key) => (data[key] = value));
  return handleCancel(request, data);
}
