import { Link, useLocation } from "wouter";
import { Search, Bell, BarChart3, Users, Calendar, FileText, TrendingUp, Settings, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Consultations", href: "/consultations", icon: Calendar },
  { name: "Medical Records", href: "/records", icon: FileText },
  { name: "Reports", href: "/reports", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 medical-blue-500 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">MedCabinet</h1>
              <p className="text-sm text-slate-500">Practice Management</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={cn(
                      "flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive
                        ? "text-medical-blue-600 medical-blue-50"
                        : "text-slate-700 hover:bg-slate-100"
                    )}>
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {navigation.find(nav => nav.href === location)?.name || "Dashboard"}
              </h2>
              <p className="text-slate-600">Welcome back, Dr. Sarah Johnson</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="w-80 pl-10"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="medical-green-500 text-white">SJ</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">Dr. Sarah Johnson</p>
                  <p className="text-slate-500">General Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
