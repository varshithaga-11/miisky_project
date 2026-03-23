import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for a free Miisky account to book appointments and manage your health.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
