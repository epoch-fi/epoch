import SideBar from "@/components/dashboard/SideBar";
import TopBar from "@/components/dashboard/TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-screen flex min-h-screen overflow-x-hidden bg-black ">
      {/* large screen sidebar */}
      <SideBar />
      {/* small screen top navbar */}
      <TopBar />
      {/* main content */}
      <div className="relative h-screen w-full bg-black text-primaryText md:pl-[80px]">
        {children}
      </div>
    </main>
  );
}
