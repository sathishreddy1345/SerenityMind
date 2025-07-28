import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Send, AlertTriangle } from "lucide-react";
import type { User } from "@shared/schema";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  createdAt: string;
}

export default function AIChatbot() {
  const [message, setMessage] = useState("");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", { message: messageText });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.isCrisis) {
        setShowCrisisAlert(true);
        setTimeout(() => setShowCrisisAlert(false), 10000); // Hide after 10 seconds
      }
      refetchHistory();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const userName = user?.firstName || user?.email?.split('@')[0] || "User";

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-3">
              <Bot className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Companion</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Calm Mentor Mode</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
            <span className="text-xs text-secondary">Online</span>
          </div>
        </div>
        
        {/* Crisis Alert */}
        {showCrisisAlert && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <p className="font-medium">Crisis Support Available</p>
              <p className="text-sm">If you're in immediate danger, please call emergency services or contact a crisis helpline.</p>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Chat Messages */}
        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
          {!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0 ? (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-xs" />
              </div>
              <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                <p className="text-sm">
                  Hello {userName}! I'm here to listen and support you. How are you feeling today, and is there anything specific you'd like to talk about?
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg: ChatMessage) => (
              <div key={msg.id} className={`chat-message flex items-start space-x-3 ${msg.isUser ? 'justify-end' : ''}`}>
                {!msg.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white text-xs" />
                  </div>
                )}
                <div className={`rounded-2xl p-3 max-w-xs ${
                  msg.isUser 
                    ? "bg-primary text-white rounded-tr-sm" 
                    : "bg-gray-100 dark:bg-slate-700 rounded-tl-sm"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.isUser ? "text-primary-100" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
                {msg.isUser && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))
          )}
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-xs" />
              </div>
              <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
