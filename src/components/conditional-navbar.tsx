"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar for login pages
  const isLoginPage = pathname.includes("/auth/login") || 
                     pathname.includes("/provider/auth/login") || 
                     pathname.includes("/admin/auth/login");
  
  // Hide customer navbar for provider routes (but not login pages)
  const isProviderRoute = pathname.startsWith("/provider") && !isLoginPage;
  
  if (isProviderRoute || isLoginPage) {
    return null;
  }
  
  return <Navbar />;
}
