import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ProducerNav } from "@/components/ProducerNav";

export default async function ProducerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <ProducerNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
