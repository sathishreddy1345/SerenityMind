import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  description?: string;
  streak: number;
}

export default function HabitTracker() {
  const [newHabitName, setNewHabitName] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits, isLoading } = useQuery({
    queryKey: ["/api/habits"],
    retry: false,
  });

  const createHabitMutation = useMutation({
    mutationFn: async (habitData: { name: string; description?: string }) => {
      await apiRequest("POST", "/api/habits", habitData);
    },
    onSuccess: () => {
      toast({
        title: "Habit created!",
        description: "Your new habit has been added successfully.",
      });
      setNewHabitName("");
      setIsAddingHabit(false);
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      await apiRequest("POST", `/api/habits/${habitId}/complete`, {});
    },
    onSuccess: () => {
      toast({
        title: "Great job!",
        description: "Habit completed for today!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
    onError: (error: any) => {
      if (error.message.includes("already completed")) {
        toast({
          title: "Already completed",
          description: "You've already completed this habit today!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to complete habit. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    createHabitMutation.mutate({
      name: newHabitName,
      description: "",
    });
  };

  const handleCompleteHabit = (habitId: string) => {
    completeHabitMutation.mutate(habitId);
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Habits</h2>
          <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary">
                <Plus className="w-4 h-4 mr-1" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <Input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Enter habit name (e.g., Morning meditation)"
                  className="w-full"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingHabit(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!newHabitName.trim() || createHabitMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          {habits && Array.isArray(habits) && habits.length > 0 ? (
            habits.map((habit: Habit) => (
              <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <button
                    onClick={() => handleCompleteHabit(habit.id)}
                    disabled={completeHabitMutation.isPending}
                    className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mr-3 hover:bg-secondary/80 transition-colors"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {habit.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {habit.streak > 0 ? `${habit.streak} day streak 🔥` : "Start your streak!"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2">No habits yet!</p>
              <p className="text-sm">Add your first habit to start building healthy routines.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
