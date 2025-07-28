import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { huggingFaceService } from "./services/huggingface";
import { 
  insertMoodEntrySchema, 
  insertChatMessageSchema, 
  insertHabitSchema,
  insertHabitCompletionSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mood tracking routes
  app.post('/api/mood-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId
      });

      const moodEntry = await storage.createMoodEntry(validatedData);
      res.json(moodEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(400).json({ message: "Failed to create mood entry" });
    }
  });

  app.get('/api/mood-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const moodEntries = await storage.getUserMoodEntries(userId, limit);
      res.json(moodEntries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.get('/api/mood-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const moodEntries = await storage.getMoodEntriesInDateRange(userId, startDate, endDate);
      
      // Calculate analytics
      const analytics = {
        entries: moodEntries,
        averageMood: moodEntries.length > 0 
          ? moodEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / moodEntries.length 
          : 0,
        totalEntries: moodEntries.length,
        moodTrend: calculateMoodTrend(moodEntries)
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching mood analytics:", error);
      res.status(500).json({ message: "Failed to fetch mood analytics" });
    }
  });

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check for crisis keywords
      const isCrisis = await huggingFaceService.detectCrisisKeywords(message);
      
      if (isCrisis) {
        const crisisResponse = {
          message: "I'm concerned about what you've shared. Please reach out to a crisis helpline immediately:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\nYou matter, and help is available.",
          isCrisis: true
        };
        
        // Save user message
        await storage.createChatMessage({
          userId,
          message,
          isUser: true
        });
        
        // Save crisis response
        await storage.createChatMessage({
          userId,
          message: crisisResponse.message,
          isUser: false,
          sentiment: "crisis"
        });
        
        return res.json(crisisResponse);
      }

      // Analyze sentiment
      const sentimentAnalysis = await huggingFaceService.analyzeSentiment(message);
      
      // Save user message
      await storage.createChatMessage({
        userId,
        message,
        isUser: true,
        sentiment: sentimentAnalysis.sentiment
      });

      // Generate AI response
      const recentMessages = await storage.getUserChatMessages(userId, 5);
      const context = recentMessages
        .reverse()
        .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.message}`)
        .join('\n');

      const aiResponse = await huggingFaceService.generateChatResponse(message, context);
      
      // Save AI response
      await storage.createChatMessage({
        userId,
        message: aiResponse,
        isUser: false,
        sentiment: "supportive"
      });

      res.json({ 
        message: aiResponse,
        sentiment: sentimentAnalysis,
        isCrisis: false 
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const chatHistory = await storage.getUserChatMessages(userId, limit);
      res.json(chatHistory.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Habit tracking routes
  app.post('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId
      });

      const habit = await storage.createHabit(validatedData);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(400).json({ message: "Failed to create habit" });
    }
  });

  app.get('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getUserHabits(userId);
      const streaks = await storage.getHabitStreaks(userId);
      
      // Combine habits with their streaks
      const habitsWithStreaks = habits.map(habit => ({
        ...habit,
        streak: streaks.find(s => s.habitId === habit.id)?.streak || 0
      }));
      
      res.json(habitsWithStreaks);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post('/api/habits/:habitId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { habitId } = req.params;
      
      // Check if already completed today
      const today = new Date();
      const existingCompletions = await storage.getHabitCompletions(userId, habitId, today);
      
      if (existingCompletions.length > 0) {
        return res.status(400).json({ message: "Habit already completed today" });
      }
      
      const completion = await storage.completeHabit({
        habitId,
        userId
      });
      
      res.json(completion);
    } catch (error) {
      console.error("Error completing habit:", error);
      res.status(500).json({ message: "Failed to complete habit" });
    }
  });

  // Affirmations route
  app.get('/api/affirmations/daily', isAuthenticated, async (req: any, res) => {
    const affirmations = [
      "You are braver than you believe, stronger than you seem, and smarter than you think.",
      "Every day is a new beginning. Take a deep breath and start again.",
      "You have survived 100% of your worst days. You're doing great.",
      "Progress, not perfection. Every small step counts.",
      "Your mental health is just as important as your physical health.",
      "It's okay to not be okay. It's not okay to give up.",
      "You are worthy of love, kindness, and compassion - especially from yourself.",
      "Healing isn't linear. Be patient with yourself.",
      "You have the strength to handle whatever comes your way.",
      "Your feelings are valid, and you deserve support."
    ];
    
    // Use date as seed for consistent daily affirmation
    const today = new Date().toDateString();
    const seedValue = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seedValue % affirmations.length;
    
    res.json({ affirmation: affirmations[index] });
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateMoodTrend(moodEntries: any[]): string {
  if (moodEntries.length < 2) return "neutral";
  
  const recent = moodEntries.slice(-3).map(entry => entry.moodScore);
  const older = moodEntries.slice(-6, -3).map(entry => entry.moodScore);
  
  if (recent.length === 0 || older.length === 0) return "neutral";
  
  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
  
  if (recentAvg > olderAvg + 0.5) return "improving";
  if (recentAvg < olderAvg - 0.5) return "declining";
  return "stable";
}
