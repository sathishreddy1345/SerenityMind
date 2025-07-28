import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Leaf, Smile } from "lucide-react";

interface SelfCareToolsProps {
  onOpenBreathing: () => void;
}

export default function SelfCareTools({ onOpenBreathing }: SelfCareToolsProps) {
  const [currentAffirmation, setCurrentAffirmation] = useState("");

  const { data: dailyAffirmation } = useQuery({
    queryKey: ["/api/affirmations/daily"],
    retry: false,
  });

  const handleShowAffirmation = () => {
    if (dailyAffirmation?.affirmation) {
      setCurrentAffirmation(dailyAffirmation.affirmation);
    }
  };

  const selfCareTools = [
    {
      name: "Breathing",
      icon: "🫁",
      color: "from-secondary/10 to-secondary/20 dark:from-secondary/20 dark:to-secondary/10",
      textColor: "text-secondary",
      action: onOpenBreathing,
    },
    {
      name: "Meditation",
      icon: <Leaf className="w-6 h-6" />,
      color: "from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/10",
      textColor: "text-primary",
      action: () => {
        // TODO: Open meditation modal
        console.log("Opening meditation");
      },
    },
    {
      name: "Affirmations",
      icon: <Heart className="w-6 h-6" />,
      color: "from-accent/10 to-accent/20 dark:from-accent/20 dark:to-accent/10",
      textColor: "text-accent",
      action: handleShowAffirmation,
    },
    {
      name: "Safe Space",
      icon: "🧘",
      color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      textColor: "text-purple-600 dark:text-purple-400",
      action: () => {
        // TODO: Open safe space modal
        console.log("Opening safe space");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Self-Care Tools</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {selfCareTools.map((tool) => (
              <button
                key={tool.name}
                onClick={tool.action}
                className={`bg-gradient-to-br ${tool.color} hover:scale-105 p-4 rounded-xl transition-all group`}
              >
                <div className={`${tool.textColor} text-xl mb-2 group-hover:scale-110 transition-transform flex justify-center`}>
                  {typeof tool.icon === "string" ? tool.icon : tool.icon}
                </div>
                <p className={`text-sm font-medium ${tool.textColor}`}>
                  {tool.name}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Affirmation Display */}
      {currentAffirmation && (
        <Card className="bg-gradient-to-br from-primary to-secondary border-0 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-2xl text-white/70 mb-4">"</div>
            <p className="text-lg font-medium mb-4">{currentAffirmation}</p>
            <p className="text-primary-100 text-sm mb-4">Daily Affirmation</p>
            <Button
              onClick={() => setCurrentAffirmation("")}
              className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-0"
            >
              <Smile className="w-4 h-4 mr-2" />
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
