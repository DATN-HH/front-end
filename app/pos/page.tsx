import HeaderBar from "@/components/pos/header-bar";

export default function POSPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderBar />
      {/* Add padding-top to main content area to account for fixed header height */}
      <main className="flex-grow pt-[68px]">
        {/* Main content of the POS page will go here */}
        <p className="p-4">Menu+ POS - Main Page (Content to be added)</p>
      </main>
    </div>
  );
}
