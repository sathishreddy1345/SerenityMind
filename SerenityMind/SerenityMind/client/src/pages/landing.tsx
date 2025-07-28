import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { Brain, Heart, Users, Shield, Moon, Sun } from "lucide-react";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">SerenityAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-600">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Mental Health
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
              Companion
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Meet SerenityAI - an AI-powered mental wellness platform that provides personalized support, 
            mood tracking, and evidence-based tools to help you thrive every day.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
            >
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 text-lg border-gray-300 dark:border-gray-600"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Companion</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Chat with an empathetic AI trained in cognitive behavioral therapy techniques
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mood Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Track your emotions and discover patterns with beautiful analytics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Self-Care Tools</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Access breathing exercises, meditation, and personalized wellness activities
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your data is encrypted and private. We never share your personal information
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to prioritize your mental wellness?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Join thousands who are already improving their mental health with SerenityAI
            </p>
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-12 py-4 text-lg font-medium"
            >
              Start Free Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
