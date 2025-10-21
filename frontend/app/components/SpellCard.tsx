import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export type SpellType = "bridge" | "swap" | "lend" | "borrow";

interface SpellCardProps {
  type: SpellType;
  icon: LucideIcon;
  title: string;
  description: string;
  onDragStart?: (e: React.DragEvent, type: SpellType) => void;
}

export const SpellCard = ({ type, icon: Icon, title, description, onDragStart }: SpellCardProps) => {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart?.(e, type)}
      className="p-4 cursor-grab active:cursor-grabbing bg-card/50 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
          <Icon className="w-6 h-6 text-primary group-hover:text-glow-purple transition-colors" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};
