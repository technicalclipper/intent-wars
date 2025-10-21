import { SpellType } from "./SpellCard";
import { BrewedSpell } from "./BrewedSpell";
import { cn } from "@/lib/utils";

export interface SpellData {
  id: string;
  type: SpellType;
  inputs?: Record<string, string>;
}

interface CauldronProps {
  spells: SpellData[];
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemoveSpell: (id: string) => void;
  onEditSpell: (id: string) => void;
  isDragOver: boolean;
}

export const Cauldron = ({
  spells,
  onDrop,
  onDragOver,
  onRemoveSpell,
  onEditSpell,
  isDragOver
}: CauldronProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent mb-2">
          The Brewing Cauldron
        </h2>
        <p className="text-muted-foreground">
          Craft your cross-chain strategy
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={cn(
          "relative w-full max-w-2xl min-h-[400px] rounded-2xl border-4 transition-all duration-300",
          isDragOver
            ? "border-accent bg-accent/10 shadow-lg shadow-accent/30"
            : "border-primary/40 bg-card/20 backdrop-blur-sm"
        )}
      >
        {/* Cauldron visual effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/30 to-transparent animate-pulse-glow" />
        </div>

        {spells.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-4 animate-float">⚗️</div>
            <p className="text-muted-foreground text-lg">
              Drop spell cards here to begin brewing
            </p>
          </div>
        ) : (
          <div className="relative z-10 p-6 space-y-4">
            {spells.map((spell, index) => (
              <div key={spell.id}>
                <BrewedSpell
                  spell={spell}
                  onRemove={onRemoveSpell}
                  onEdit={onEditSpell}
                />
                {index < spells.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-px h-8 bg-gradient-to-b from-primary via-secondary to-accent animate-pulse-glow" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
