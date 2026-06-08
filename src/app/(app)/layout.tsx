export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex-1 bg-[#07070b] text-zinc-100">{children}</div>
  );
}
