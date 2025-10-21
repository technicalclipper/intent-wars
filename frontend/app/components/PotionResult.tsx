import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Fuel, Award } from "lucide-react";

interface PotionResultProps {
  result: {
    chainsUsed: string[];
    finalYield: number;
    gasCost: number;
    efficiencyScore: number;
  } | null;
}

export const PotionResult = ({ result }: PotionResultProps) => {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-card/20 backdrop-blur-sm rounded-lg border border-primary/20">
        <div className="text-6xl mb-4 animate-float">🧪</div>
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Awaiting Brew
        </h3>
        <p className="text-sm text-center text-muted-foreground max-w-xs">
          Configure your spells and brew your potion to see the results
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-card/30 backdrop-blur-md rounded-lg border border-accent/40 glow-gold">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-5xl animate-pulse-glow">🧪</div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Potion Result
          </h3>
          <p className="text-sm text-muted-foreground">Cross-Chain Yield Draught</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-card/50 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Chains Used</p>
              <p className="font-semibold">{result.chainsUsed.join(" → ")}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Final Yield</p>
              <p className="font-semibold text-xl text-accent">+{result.finalYield.toFixed(2)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Fuel className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Gas Cost</p>
              <p className="font-semibold">${result.gasCost.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 border-accent/50 glow-gold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Efficiency Score</p>
                <p className="text-3xl font-bold text-accent">{result.efficiencyScore}/100</p>
              </div>
            </div>
            {result.efficiencyScore >= 80 && (
              <div className="text-4xl animate-float">⭐</div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-muted">
        <p className="text-xs text-muted-foreground text-center">
          This is a simulated result. Actual yields may vary based on market conditions.
        </p>
      </div>
    </div>
  );
};
