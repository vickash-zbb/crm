import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Users, FileText, BarChart3, Clock, LogOut, User, Settings, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Building2,
      show: true
    },
    {
      href: "/work-entries",
      label: "Work Entries",
      icon: FileText,
      show: true
    },
    {
      href: "/employees",
      label: "Employees",
      icon: Users,
      show: user?.role === 'admin' || user?.role === 'manager'
    },
    {
      href: "/attendance",
      label: "Attendance",
      icon: Clock,
      show: user?.role === 'admin' || user?.role === 'manager'
    },
    {
      href: "/reports",
      label: "Reports",
      icon: BarChart3,
      show: user?.role === 'admin' || user?.role === 'manager'
    }
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-business-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200 focus-ring rounded-md p-1">
            <Building2 className="h-8 w-8" />
            <div className="hidden md:block">
              <h1 className="text-xl md:text-2xl font-bold">College Work Management</h1>
              <p className="text-primary-foreground/80 text-xs md:text-sm">Multi-College Task & Cost Management</p>
            </div>
            <div className="block md:hidden">
              <h1 className="text-lg font-bold">CWM</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {filteredNavItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-primary-foreground hover:bg-white/10 navbar-btn-hover header-btn-hover focus-ring ${
                    location.pathname === item.href ? 'bg-white/10' : ''
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}

            <Link to="/new-work-entry">
              <Button
                size="sm"
                className="bg-white/10 text-primary-foreground hover:bg-white/20 border-white/20 ml-2 btn-hover-lift header-btn-success-hover focus-ring"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-white/10 text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Link to="/new-work-entry">
              <Button
                size="sm"
                className="bg-white/10 text-primary-foreground hover:bg-white/20 border-white/20 mr-2 btn-hover-lift header-btn-success-hover focus-ring"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/10 btn-hover-scale header-btn-accent-hover focus-ring"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-primary border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-2 px-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-md navbar-btn-hover header-btn-hover ${
                    location.pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-primary-foreground hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              ))}

              {user && (
                <div className="pt-4 mt-4 border-t border-white/10">
                  <div className="flex items-center px-4 py-2">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="bg-white/10 text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-primary-foreground/80 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary-foreground hover:bg-white/10 mt-2 btn-hover-lift header-btn-accent-hover focus-ring"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Log out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
