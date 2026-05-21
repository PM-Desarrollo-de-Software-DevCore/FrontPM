import AuthGuard from "@/components/auth/AuthGuard";
import SideBarLayout from "../Layout/sidebar";
import Topbar from "../Layout/topbar";
import ThemeProvider from "@/components/ui/ThemeProvider";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <Topbar />
      <ThemeProvider>
        <SideBarLayout>{children}</SideBarLayout>
      </ThemeProvider>
    </AuthGuard>
  );
}
