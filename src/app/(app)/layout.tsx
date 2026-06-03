import AuthGuard from "@/components/auth/AuthGuard";
import SideBarLayout from "../Layout/sidebar";
import Topbar from "../Layout/topbar";
import ThemeProvider from "@/components/ui/ThemeProvider";
import LeaderboardPrefetch from "@/components/leaderboard/LeaderboardPrefetch";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <LeaderboardPrefetch />
      <Topbar />
      <ThemeProvider>
        <SideBarLayout>{children}</SideBarLayout>
      </ThemeProvider>
    </AuthGuard>
  );
}
