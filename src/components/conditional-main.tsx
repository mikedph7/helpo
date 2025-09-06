"use client";

import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check for login pages
  const isLoginPage = pathname.includes("/auth/login") || 
                     pathname.includes("/provider/auth/login") || 
                     pathname.includes("/admin/auth/login");
  
  // Provider routes have their own layout styling (but not login pages)
  const isProviderRoute = pathname.startsWith("/provider") && !isLoginPage;
  
  // Login pages should take full screen without container styling
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  if (isProviderRoute) {
    return <>{children}</>;
  }
  
  return <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>;
}
