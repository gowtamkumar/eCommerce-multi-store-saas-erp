import { NextRequest, NextResponse } from "next/server";

async function handleSuccess(request: NextRequest, data: any = {}) {
  try {
    const tran_id = request.nextUrl.searchParams.get("tran_id") || data.tran_id;

    // Use internal Docker service name for server-side
    const backendUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";

    const storeId = data.value_b;
    const res = await fetch(`${backendUrl}/billing/complete/success?tran_id=${tran_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId || "",
      },
      body: JSON.stringify(data),
      redirect: "manual",
    });

    if (!res.ok && res.status !== 302 && res.status !== 303 && res.status !== 307) {
      console.error("Backend failed to process success:", await res.text());
    }

    // Redirect to UI Success Page with correct subdomain / domain
    const host = request.headers.get("host") || request.nextUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${protocol}://${host}`;

    return NextResponse.redirect(`${origin}/admin/settings/billing/success?tran_id=${tran_id}`, 303);

  } catch (error) {
    console.error("Billing Success Route Error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/admin/settings/billing/fail?error=server_error`, 303);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const data: any = {};
  if (formData) {
    formData.forEach((value, key) => (data[key] = value));
  }
  return handleSuccess(request, data);
}

export async function GET(request: NextRequest) {
  const data: any = {};
  request.nextUrl.searchParams.forEach((value, key) => (data[key] = value));
  return handleSuccess(request, data);
}
