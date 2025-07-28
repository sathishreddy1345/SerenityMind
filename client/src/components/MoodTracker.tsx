import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, TrendingUp } from "lucide-react";

const moodOptions = [
  { value: "amazing", emoji: "😄", label: "Amazing", score: 10 },
  { value: "good", emoji: "😊", label: "Good", score: 8 },
  { value: "okay", emoji: "😐", label: "Okay", score: 6 },
  { value: "down", emoji: "😔", label: "Down", score: 4 },
  { value: "terrible", emoji: "😰", label: "Terrible", score: 2 },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentEntries } = useQuery({
    queryKey: ["/api/mood-entries"],
    retry: false,
  });

  const saveMoodMutation = useMutation({
    mutationFn: async (data: { mood: string; moodScore: number; journalEntry: string }) => {
      await apiRequest("POST", "/api/mood-entries", data);
    },
    onSuccess: () => {
      toast({
        title: "Mood saved!",
        description: "Your mood entry has been recorded successfully.",
      });
      setSelectedMood("");
      setJournalEntry("");
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood-analytics"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save mood entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveMood = () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today before saving.",
        variant: "destructive",
      });
      return;
    }

    const moodData = moodOptions.find(m => m.value === selectedMood);
    if (!moodData) return;

    saveMoodMutation.mutate({
      mood: selectedMood,
      moodScore: moodData.score,
      journalEntry: journalEntry.trim(),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getMoodEmoji = (mood: string) => {
    return moodOptions.find(m => m.value === mood)?.emoji || "😐";
  };

  const getMoodLabel = (mood: string) => {
    return moodOptions.find(m => m.value === mood)?.label || mood;
  };

  return (
    <div className="space-y-6">
      {/* Mood Tracker */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Today's Mood</h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date().toLocaleDateString("en-US", { 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              })}
            </div>
          </div>
          
          {/* Mood Selector */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`mood-btn p-4 rounded-xl transition-all text-center group ${
                  selectedMood === mood.value
                    ? "bg-primary bg-opacity-20 border-2 border-primary dark:bg-primary dark:bg-opacity-30"
                    : "bg-gray-50 dark:bg-slate-700 hover:bg-primary hover:bg-opacity-10 dark:hover:bg-slate-600 border-2 border-transparent"
                }`}
              >
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className={`text-xs font-medium ${
                  selectedMood === mood.value
                    ? "text-primary"
                    : "text-gray-600 dark:text-gray-300 group-hover:text-primary"
                }`}>
                  {mood.label}
                </div>
              </button>
            ))}
          </div>
          
          {/* Journal Entry */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's on your mind?
            </label>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Share your thoughts, feelings, or what happened today..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>7-day streak</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Improving trend</span>
              </div>
            </div>
            <Button
              onClick={handleSaveMood}
              disabled={saveMoodMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {saveMoodMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Journal Entries */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Journal Entries</h2>
            <Button variant="ghost" className="text-primary text-sm font-medium hover:text-primary/80">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentEntries && Array.isArray(recentEntries) && recentEntries.length > 0 ? (
              recentEntries.slice(0, 3).map((entry: any) => (
                <div key={entry.id} className="border-l-4 border-secondary pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {formatDate(entry.createdAt)}
                    </span>
                    <div className="flex items-center">
                      <span className="text-lg mr-1">{getMoodEmoji(entry.mood)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {getMoodLabel(entry.mood)}
                      </span>
                    </div>
                  </div>
                  {entry.journalEntry && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {entry.journalEntry.length > 100 
                        ? `${entry.journalEntry.substring(0, 100)}...` 
                        : entry.journalEntry
                      }
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No journal entries yet. Start tracking your mood above!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
