import type { Metadata } from "next";
import ProviderNavbar from "@/components/provider/navbar";

export const metadata: Metadata = {
  title: "Helpo Provider",
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderNavbar>
      {children}
    </ProviderNavbar>
  );
}
