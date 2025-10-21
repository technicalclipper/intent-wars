import { SpellCard, SpellType } from "./SpellCard";
import { GitBranch, Repeat, Vault, HandCoins } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpellDeckProps {
  onSpellDragStart: (e: React.DragEvent, type: SpellType) => void;
}

export const SpellDeck = ({ onSpellDragStart }: SpellDeckProps) => {
  const spells = [
    {
      type: "bridge" as SpellType,
      icon: GitBranch,
      title: "🪶 Bridge Scroll",
      description: "Move essences between realms"
    },
    {
      type: "swap" as SpellType,
      icon: Repeat,
      title: "💧 Swap Crystal",
      description: "Exchange essences within a realm"
    },
    {
      type: "lend" as SpellType,
      icon: Vault,
      title: "🏦 Lend Rune",
      description: "Deposit to gain yield"
    },
    {
      type: "borrow" as SpellType,
      icon: HandCoins,
      title: "🔮 Borrow Rune",
      description: "Borrow against collateral"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-card/30 backdrop-blur-md rounded-lg border border-primary/20 p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Spell Deck
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag spells to your cauldron
        </p>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {spells.map((spell) => (
            <SpellCard
              key={spell.type}
              {...spell}
              onDragStart={onSpellDragStart}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
