import { NextRequest, NextResponse } from "next/server";

async function handleSuccess(request: NextRequest, data: any = {}) {
  try {
    const tran_id = request.nextUrl.searchParams.get("tran_id") || data.tran_id;
    console.log("Success callback proxy route hit. tran_id:", tran_id, "data:", JSON.stringify(data));

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

    let isVerificationSuccess = false;
    if (res.ok) {
      try {
        const responseData = await res.json();
        // Backend returns success: true and data is the SubscriptionInvoiceEntity
        if (responseData.success && responseData.data?.status === "completed") {
          isVerificationSuccess = true;
        } else {
          console.warn("Backend processed success callback, but invoice status is not completed:", responseData);
        }
      } catch (e) {
        console.error("Failed to parse backend response JSON:", e);
      }
    } else {
      console.error("Backend failed to process success:", await res.text());
    }

    // Redirect to UI Success Page with correct subdomain / domain
    const host = request.headers.get("host") || request.nextUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${protocol}://${host}`;

    if (isVerificationSuccess) {
      return NextResponse.redirect(`${origin}/admin/settings/billing/success?tran_id=${tran_id}`, 303);
    } else {
      return NextResponse.redirect(`${origin}/admin/settings/billing/fail?tran_id=${tran_id}&reason=verification_failed`, 303);
    }

  } catch (error) {
    console.error("Billing Success Proxy Route Error:", error);
    const host = request.headers.get("host") || request.nextUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${protocol}://${host}`;
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
    console.error("Failed to parse POST body in success route:", err);
  }
  return handleSuccess(request, data);
}

export async function GET(request: NextRequest) {
  const data: any = {};
  request.nextUrl.searchParams.forEach((value, key) => (data[key] = value));
  return handleSuccess(request, data);
}
