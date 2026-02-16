import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser, logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Feedback Analytics
                </h1>
                <p className="text-[0.6rem] font-medium text-slate-400 tracking-wider uppercase">
                  Enterprise Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                <Shield className="h-3 w-3 text-slate-400" />
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">
                    {user.email}
                  </p>
                  <p className="text-[0.55rem] font-medium text-slate-400 uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </div>
              <form action={logout}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold h-8 px-3"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
