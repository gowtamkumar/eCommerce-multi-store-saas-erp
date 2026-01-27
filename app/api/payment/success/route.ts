import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};
    formData.forEach((value, key) => (data[key] = value));

    const tran_id = request.nextUrl.searchParams.get("tran_id");

    console.log("PAYMENT SUCCESS PAYLOAD:", data);
    console.log("Transaction ID:", tran_id);

    // Call Backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
    
    // We assume backend expects query param tran_id and body with gateway response
    const tenantId = data.value_b;
    console.log("Tenant ID from callback:", tenantId);

    const res = await fetch(`${backendUrl}/payment/success?tran_id=${tran_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": tenantId,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
       console.error("Backend failed to process success:", await res.text());
       // Depending on requirements, might want to redirect to error page even if backend fails
    }

    // Redirect to UI Success Page with correct subdomain
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;
    
    return NextResponse.redirect(`${origin}/payment/success?tran_id=${tran_id}`, 303);

  } catch (error) {
    console.error("Payment Success Route Error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/payment/fail?error=server_error`, 303);
  }
}
