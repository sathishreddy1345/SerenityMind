import {
  users,
  moodEntries,
  chatMessages,
  habits,
  habitCompletions,
  type User,
  type UpsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type ChatMessage,
  type InsertChatMessage,
  type Habit,
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Mood tracking operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string, limit?: number): Promise<MoodEntry[]>;
  getMoodEntriesInDateRange(userId: string, startDate: Date, endDate: Date): Promise<MoodEntry[]>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Habit operations
  createHabit(habit: InsertHabit): Promise<Habit>;
  getUserHabits(userId: string): Promise<Habit[]>;
  completeHabit(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  getHabitCompletions(userId: string, habitId: string, date: Date): Promise<HabitCompletion[]>;
  getHabitStreaks(userId: string): Promise<Array<{ habitId: string; streak: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Mood tracking operations
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db
      .insert(moodEntries)
      .values(entry)
      .returning();
    return moodEntry;
  }

  async getUserMoodEntries(userId: string, limit = 10): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(limit);
  }

  async getMoodEntriesInDateRange(userId: string, startDate: Date, endDate: Date): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.createdAt, startDate),
          sql`${moodEntries.createdAt} <= ${endDate}`
        )
      )
      .orderBy(moodEntries.createdAt);
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async getUserChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Habit operations
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db
      .insert(habits)
      .values(habit)
      .returning();
    return newHabit;
  }

  async getUserHabits(userId: string): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
      .orderBy(habits.createdAt);
  }

  async completeHabit(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    const [habitCompletion] = await db
      .insert(habitCompletions)
      .values(completion)
      .returning();
    return habitCompletion;
  }

  async getHabitCompletions(userId: string, habitId: string, date: Date): Promise<HabitCompletion[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.habitId, habitId),
          gte(habitCompletions.completedAt, startOfDay),
          sql`${habitCompletions.completedAt} <= ${endOfDay}`
        )
      );
  }

  async getHabitStreaks(userId: string): Promise<Array<{ habitId: string; streak: number }>> {
    // This is a simplified implementation - in production, you'd want more sophisticated streak calculation
    const userHabits = await this.getUserHabits(userId);
    const streaks = [];

    for (const habit of userHabits) {
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) { // Check last 30 days
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        const completions = await this.getHabitCompletions(userId, habit.id, checkDate);
        if (completions.length > 0) {
          streak++;
        } else {
          break;
        }
      }
      
      streaks.push({ habitId: habit.id, streak });
    }

    return streaks;
  }
}

export const storage = new DatabaseStorage();
