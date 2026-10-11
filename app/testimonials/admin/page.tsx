import type { Metadata } from "next";
import { AdminConsole } from "./AdminConsole";

export const metadata: Metadata = {
  title: "Curation",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminConsole />;
}
