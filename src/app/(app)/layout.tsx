import AuthGuard from "@/components/auth/AuthGuard";
import SideBarLayout from "../Layout/sidebar";
import Topbar from "../Layout/topbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <Topbar />
      <SideBarLayout>{children}</SideBarLayout>
    </AuthGuard>
  );
}
