import { Link, useLocation } from "wouter";
import { Search, Bell, BarChart3, Users, Calendar, FileText, TrendingUp, Settings, Stethoscope, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

const SidebarContent = () => {
  const [location] = useLocation();
  
  return (
    <>
      <div className="p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 medical-blue-500 rounded-lg flex items-center justify-center">
            <Stethoscope className="text-white text-sm lg:text-lg" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900">MedCabinet</h1>
            <p className="text-xs lg:text-sm text-slate-500">Practice Management</p>
          </div>
        </div>
      </div>
      
      <nav className="px-2 lg:px-4 pb-6">
        <ul className="space-y-1 lg:space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-lg font-medium transition-colors text-sm lg:text-base cursor-pointer",
                    isActive
                      ? "text-medical-blue-600 medical-blue-50"
                      : "text-slate-700 hover:bg-slate-100"
                  )}>
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                    {item.name}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-white shadow-lg border-r border-slate-200 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-white">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <div>
                <h2 className="text-lg lg:text-2xl font-bold text-slate-900">
                  {navigation.find(nav => nav.href === location)?.name || "Dashboard"}
                </h2>
                <p className="text-sm lg:text-base text-slate-600 hidden sm:block">Welcome back, Dr. Sarah Johnson</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search - Hidden on mobile, shown on tablet+ */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="w-48 lg:w-80 pl-10 text-sm"
                />
              </div>
              
              {/* Search button for mobile */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                  <AvatarFallback className="medical-green-500 text-white text-sm">SJ</AvatarFallback>
                </Avatar>
                <div className="text-sm hidden sm:block">
                  <p className="font-medium text-slate-900">Dr. Sarah Johnson</p>
                  <p className="text-slate-500 text-xs lg:text-sm">General Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
