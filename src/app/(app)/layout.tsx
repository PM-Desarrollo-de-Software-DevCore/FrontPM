import SideBarLayout from "../Layout/sidebar";
import Topbar from "../Layout/topbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Topbar />
      <SideBarLayout>{children}</SideBarLayout>
    </>
  );
}
