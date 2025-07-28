import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPhase = "ready" | "inhale" | "hold" | "exhale" | "pause";

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>("ready");
  const [seconds, setSeconds] = useState(0);
  const [cycle, setCycle] = useState(0);
  const totalCycles = 4;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && isOpen) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          
          // 4-7-8 breathing pattern
          if (phase === "inhale" && newSeconds >= 4) {
            setPhase("hold");
            return 0;
          } else if (phase === "hold" && newSeconds >= 7) {
            setPhase("exhale");
            return 0;
          } else if (phase === "exhale" && newSeconds >= 8) {
            const newCycle = cycle + 1;
            setCycle(newCycle);
            
            if (newCycle >= totalCycles) {
              setIsActive(false);
              setPhase("ready");
              setCycle(0);
              return 0;
            } else {
              setPhase("pause");
              return 0;
            }
          } else if (phase === "pause" && newSeconds >= 2) {
            setPhase("inhale");
            return 0;
          }
          
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phase, cycle, isOpen]);

  const startBreathing = () => {
    setIsActive(true);
    setPhase("inhale");
    setSeconds(0);
    setCycle(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase("ready");
    setSeconds(0);
    setCycle(0);
  };

  const getInstructionText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "pause":
        return "Rest";
      default:
        return "Get Ready";
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case "inhale":
        return "scale-125";
      case "hold":
        return "scale-125";
      case "exhale":
        return "scale-75";
      default:
        return "scale-100";
    }
  };

  const handleClose = () => {
    stopBreathing();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold mb-4">4-7-8 Breathing Exercise</h3>
          
          <div className="mb-6">
            <div 
              className={`w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center transition-transform duration-1000 ease-in-out ${getCircleScale()}`}
            >
              <span className="text-white font-medium">{getInstructionText()}</span>
            </div>
          </div>
          
          {isActive && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cycle {cycle + 1} of {totalCycles}
              </p>
              <p className="text-lg font-medium">
                {getInstructionText()} {phase !== "ready" && phase !== "pause" ? `(${seconds})` : ""}
              </p>
            </div>
          )}
          
          {!isActive && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Follow the circle and instructions for a calming breathing exercise
            </p>
          )}
          
          <div className="flex space-x-3">
            {!isActive ? (
              <>
                <Button 
                  onClick={startBreathing}
                  className="flex-1 bg-primary hover:bg-primary hover:bg-opacity-90"
                >
                  Start
                </Button>
                <Button 
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={stopBreathing}
                  variant="outline"
                  className="flex-1"
                >
                  Stop
                </Button>
                <Button 
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </>
            )}
          </div>
          
          {cycle >= totalCycles && (
            <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
              <p className="text-secondary font-medium">Great job! 🎉</p>
              <p className="text-sm text-secondary/80">You've completed the breathing exercise.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
