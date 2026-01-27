import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};
    formData.forEach((value, key) => (data[key] = value));

    const tran_id = request.nextUrl.searchParams.get("tran_id");

    console.log("PAYMENT FAIL PAYLOAD:", data);
    console.log("Transaction ID:", tran_id);

    // Call Backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
    
    await fetch(`${backendUrl}/payment/fail?tran_id=${tran_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Redirect to UI Fail Page
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/payment/fail?tran_id=${tran_id}`, 303);

  } catch (error) {
    console.error("Payment Fail Route Error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/payment/fail?error=server_error`, 303);
  }
}
