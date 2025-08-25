import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children, mainSidebarCollapsed = false }) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      <div
        className={`shrink-0 h-screen overflow-hidden transition-[width] duration-300 ease-in-out ${
          mainSidebarCollapsed ? "w-0" : "w-64"
        }`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
