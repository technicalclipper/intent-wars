import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpellType } from "./SpellCard";

interface SpellInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spellType: SpellType | null;
  onSubmit: (inputs: Record<string, string>) => void;
  initialInputs?: Record<string, string>;
}

const chains = ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base"];
const tokens = ["ETH", "USDC", "USDT", "DAI", "WBTC"];

export const SpellInputDialog = ({
  isOpen,
  onClose,
  spellType,
  onSubmit,
  initialInputs
}: SpellInputDialogProps) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialInputs) {
      setInputs(initialInputs);
    } else {
      setInputs({});
    }
  }, [initialInputs, spellType]);

  const handleSubmit = () => {
    onSubmit(inputs);
    onClose();
  };

  const renderInputs = () => {
    switch (spellType) {
      case "bridge":
        return (
          <>
            <div className="space-y-2">
              <Label>From Chain</Label>
              <Select value={inputs.fromChain} onValueChange={(v) => setInputs({ ...inputs, fromChain: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map(chain => <SelectItem key={chain} value={chain}>{chain}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Chain</Label>
              <Select value={inputs.toChain} onValueChange={(v) => setInputs({ ...inputs, toChain: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map(chain => <SelectItem key={chain} value={chain}>{chain}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Token</Label>
              <Select value={inputs.token} onValueChange={(v) => setInputs({ ...inputs, token: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => <SelectItem key={token} value={token}>{token}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={inputs.amount || ""}
                onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
          </>
        );

      case "swap":
        return (
          <>
            <div className="space-y-2">
              <Label>Chain</Label>
              <Select value={inputs.chain} onValueChange={(v) => setInputs({ ...inputs, chain: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map(chain => <SelectItem key={chain} value={chain}>{chain}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Token</Label>
              <Select value={inputs.fromToken} onValueChange={(v) => setInputs({ ...inputs, fromToken: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => <SelectItem key={token} value={token}>{token}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Token</Label>
              <Select value={inputs.toToken} onValueChange={(v) => setInputs({ ...inputs, toToken: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => <SelectItem key={token} value={token}>{token}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={inputs.amount || ""}
                onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
          </>
        );

      case "lend":
        return (
          <>
            <div className="space-y-2">
              <Label>Chain</Label>
              <Select value={inputs.chain} onValueChange={(v) => setInputs({ ...inputs, chain: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map(chain => <SelectItem key={chain} value={chain}>{chain}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Token</Label>
              <Select value={inputs.token} onValueChange={(v) => setInputs({ ...inputs, token: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => <SelectItem key={token} value={token}>{token}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select value={inputs.protocol} onValueChange={(v) => setInputs({ ...inputs, protocol: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aave">Aave</SelectItem>
                  <SelectItem value="Compound">Compound</SelectItem>
                  <SelectItem value="MagicBank">MagicBank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={inputs.amount || ""}
                onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
          </>
        );

      case "borrow":
        return (
          <>
            <div className="space-y-2">
              <Label>Chain</Label>
              <Select value={inputs.chain} onValueChange={(v) => setInputs({ ...inputs, chain: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map(chain => <SelectItem key={chain} value={chain}>{chain}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Collateral Token</Label>
              <Select value={inputs.collateral} onValueChange={(v) => setInputs({ ...inputs, collateral: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => <SelectItem key={token} value={token}>{token}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Borrow Token</Label>
              <Select value={inputs.borrowToken} onValueChange={(v) => setInputs({ ...inputs, borrowToken: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => <SelectItem key={token} value={token}>{token}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={inputs.amount || ""}
                onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (spellType) {
      case "bridge": return "Configure Bridge Scroll";
      case "swap": return "Configure Swap Crystal";
      case "lend": return "Configure Lend Rune";
      case "borrow": return "Configure Borrow Rune";
      default: return "Configure Spell";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-primary/40">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            Enter the parameters for this spell
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {renderInputs()}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
