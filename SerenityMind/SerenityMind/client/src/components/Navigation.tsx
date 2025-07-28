import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Moon, Sun } from "lucide-react";
import type { User } from "@shared/schema";

export default function Navigation() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const userName = user?.firstName || user?.email?.split('@')[0] || "User";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">SerenityAI</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-primary px-3 py-2 rounded-md text-sm font-medium border-b-2 border-primary">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Chat
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Learning
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Tools
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-gray-600" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
            </Button>
            
            {/* Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
                <AvatarFallback className="bg-primary text-white text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block text-gray-900 dark:text-white">
                {userName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
