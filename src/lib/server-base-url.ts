import { headers } from "next/headers";

export async function getServerBaseUrl() {
  // In the browser, relative fetch is fine.
  if (typeof window !== "undefined") {
    return "";
  }

  // On the server, we need an absolute URL.
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  return `${protocol}://${host}`;
}
