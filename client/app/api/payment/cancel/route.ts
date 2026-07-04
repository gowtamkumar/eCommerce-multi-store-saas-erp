import { NextRequest, NextResponse } from "next/server";

async function handleCancel(request: NextRequest, data: any = {}) {
  try {
    const tran_id = request.nextUrl.searchParams.get("tran_id") || data.tran_id;

    // Use internal Docker service name for server-side
    const backendUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";

    const storeId = data.value_b;

    await fetch(`${backendUrl}/payment/cancel?tran_id=${tran_id}`, {
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

    return NextResponse.redirect(`${origin}/payment/cancel?tran_id=${tran_id}`, 303);

  } catch (error) {
    console.error("Payment Cancel Route Error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/payment/fail?error=server_error`, 303);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const data: any = {};
  if (formData) {
    formData.forEach((value, key) => (data[key] = value));
  }
  return handleCancel(request, data);
}

export async function GET(request: NextRequest) {
  const data: any = {};
  request.nextUrl.searchParams.forEach((value, key) => (data[key] = value));
  return handleCancel(request, data);
}
