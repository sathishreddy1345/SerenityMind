import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import type { User } from "@shared/schema";
import MoodTracker from "@/components/MoodTracker";
import MoodAnalytics from "@/components/MoodAnalytics";
import AIChatbot from "@/components/AIChatbot";
import SelfCareTools from "@/components/SelfCareTools";
import HabitTracker from "@/components/HabitTracker";
import BreathingModal from "@/components/BreathingModal";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.firstName || user?.email?.split('@')[0] || "Friend";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {getGreeting()}, {userName}! 🌅
            </h1>
            <p className="text-primary-100 mb-4">
              How are you feeling today? Let's check in with your mental wellness.
            </p>
            <Button 
              onClick={() => document.getElementById('mood-tracker')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-0"
            >
              <Heart className="w-4 h-4 mr-2" />
              Quick Mood Check-in
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Mood Tracking & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <div id="mood-tracker">
              <MoodTracker />
            </div>
            <MoodAnalytics />
          </div>
          
          {/* Right Column: AI Chat & Self-Care Tools */}
          <div className="space-y-6">
            <AIChatbot />
            <SelfCareTools onOpenBreathing={() => setShowBreathingModal(true)} />
            <HabitTracker />
            
            {/* Daily Affirmation */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white">
              <div className="text-center">
                <div className="text-2xl text-white/70 mb-4">"</div>
                <p className="text-lg font-medium mb-4">
                  You are braver than you believe, stronger than you seem, and smarter than you think.
                </p>
                <p className="text-primary-100 text-sm mb-4">Daily Affirmation</p>
                <Button 
                  variant="ghost"
                  className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-0"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  New Affirmation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breathing Modal */}
      <BreathingModal 
        isOpen={showBreathingModal} 
        onClose={() => setShowBreathingModal(false)} 
      />

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 md:hidden z-40">
        <div className="grid grid-cols-4 gap-1">
          <button className="flex flex-col items-center justify-center py-2 text-primary">
            <Heart className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 text-gray-600 dark:text-gray-400">
            <div className="w-5 h-5 mb-1">💬</div>
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 text-gray-600 dark:text-gray-400">
            <div className="w-5 h-5 mb-1">🧘</div>
            <span className="text-xs font-medium">Tools</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 text-gray-600 dark:text-gray-400">
            <div className="w-5 h-5 mb-1">👤</div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
