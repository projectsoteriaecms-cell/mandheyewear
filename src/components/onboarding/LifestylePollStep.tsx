import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStylePolls, useSubmitAllPollResponses, StylePoll } from "@/hooks/useStylePolls";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifestylePollStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const LifestylePollStep = ({ onNext, onBack }: LifestylePollStepProps) => {
  const { data: polls = [], isLoading } = useStylePolls("lifestyle");
  const submitResponses = useSubmitAllPollResponses();
  const { toast } = useToast();

  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});

  const currentPoll = polls[currentPollIndex];
  const isLastPoll = currentPollIndex === polls.length - 1;

  const handleSingleSelect = (pollId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [pollId]: value }));
  };

  const handleMultiSelect = (pollId: string, value: string) => {
    setResponses((prev) => {
      const current = prev[pollId] as string[] | undefined;
      if (!current) {
        return { ...prev, [pollId]: [value] };
      }
      if (current.includes(value)) {
        return { ...prev, [pollId]: current.filter((v) => v !== value) };
      }
      return { ...prev, [pollId]: [...current, value] };
    });
  };

  const canProceed = () => {
    if (!currentPoll) return false;
    const response = responses[currentPoll.id];
    if (currentPoll.poll_type === "multi_select") {
      return Array.isArray(response) && response.length > 0;
    }
    return !!response;
  };

  const handleNext = async () => {
    if (isLastPoll) {
      // Submit all responses
      try {
        const responsesToSubmit = Object.entries(responses).map(([pollId, response]) => ({
          pollId,
          response,
        }));
        await submitResponses.mutateAsync(responsesToSubmit);
        onNext();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save responses. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setCurrentPollIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPollIndex === 0) {
      onBack();
    } else {
      setCurrentPollIndex((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentPoll) {
    // No polls available, skip this step
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">No additional questions at this time.</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const currentResponse = responses[currentPoll.id];

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">Lifestyle Preferences</h2>
        <div className="flex justify-center gap-1">
          {polls.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors",
                index <= currentPollIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-1">{currentPoll.question}</h3>
          <p className="text-sm text-muted-foreground">
            {currentPoll.poll_type === "multi_select"
              ? "Select all that apply"
              : "Select one option"}
          </p>
        </div>

        <div className="grid gap-3">
          {currentPoll.options.map((option) => {
            const isSelected =
              currentPoll.poll_type === "multi_select"
                ? (currentResponse as string[] | undefined)?.includes(option)
                : currentResponse === option;

            return (
              <Card
                key={option}
                className={cn(
                  "p-4 cursor-pointer transition-all relative",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-primary/50"
                )}
                onClick={() => {
                  if (currentPoll.poll_type === "multi_select") {
                    handleMultiSelect(currentPoll.id, option);
                  } else {
                    handleSingleSelect(currentPoll.id, option);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{option}</p>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={handlePrev} disabled={submitResponses.isPending}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed() || submitResponses.isPending}>
          {submitResponses.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {isLastPoll ? "Complete" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
