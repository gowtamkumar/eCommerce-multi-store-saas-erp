import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};
    formData.forEach((value, key) => (data[key] = value));

    const tran_id = request.nextUrl.searchParams.get("tran_id");

    // Use internal Docker service name for server-side
    const backendUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";

    const storeId = data.value_b;

    await fetch(`${backendUrl}/payment/fail?tran_id=${tran_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(data),
    });

    // Redirect to UI Fail Page with correct subdomain
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    return NextResponse.redirect(`${origin}/payment/fail?tran_id=${tran_id}`, 303);

  } catch (error) {
    console.error("Payment Fail Route Error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/payment/fail?error=server_error`, 303);
  }
}
