import { SpellData } from "./Cauldron";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Edit2, GitBranch, Repeat, Vault, HandCoins } from "lucide-react";

interface BrewedSpellProps {
  spell: SpellData;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

export const BrewedSpell = ({ spell, onRemove, onEdit }: BrewedSpellProps) => {
  const getSpellIcon = () => {
    switch (spell.type) {
      case "bridge": return GitBranch;
      case "swap": return Repeat;
      case "lend": return Vault;
      case "borrow": return HandCoins;
    }
  };

  const getSpellTitle = () => {
    switch (spell.type) {
      case "bridge": return "🪶 Bridge Scroll";
      case "swap": return "💧 Swap Crystal";
      case "lend": return "🏦 Lend Rune";
      case "borrow": return "🔮 Borrow Rune";
    }
  };

  const Icon = getSpellIcon();
  const isConfigured = spell.inputs && Object.keys(spell.inputs).length > 0;

  return (
    <Card className={`p-4 relative group ${isConfigured ? 'border-accent glow-gold' : 'border-primary/50'} bg-card/70 backdrop-blur-sm transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isConfigured ? 'bg-accent/20' : 'bg-primary/20'}`}>
          <Icon className={`w-5 h-5 ${isConfigured ? 'text-accent' : 'text-primary'}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{getSpellTitle()}</h4>
          {isConfigured && spell.inputs && (
            <p className="text-xs text-muted-foreground mt-1">
              {Object.entries(spell.inputs).map(([key, value]) => `${key}: ${value}`).join(" • ")}
            </p>
          )}
          {!isConfigured && (
            <p className="text-xs text-destructive mt-1">Click edit to configure</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(spell.id)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(spell.id)}
            className="h-8 w-8 p-0 hover:bg-destructive/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
