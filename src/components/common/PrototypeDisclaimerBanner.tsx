import React, { useState } from 'react';
import { ShieldAlert, Info, X, ExternalLink } from 'lucide-react';

interface PrototypeDisclaimerBannerProps {
  onOpenFaq?: () => void;
}

export const PrototypeDisclaimerBanner: React.FC<PrototypeDisclaimerBannerProps> = ({ onOpenFaq }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div 
      id="prototype-disclaimer-banner"
      className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-3 text-[11px] font-medium transition-all"
    >
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 font-bold uppercase tracking-wider text-[9px] font-mono shrink-0">
          Simulation Prototype
        </span>
        <span className="text-amber-950 font-semibold truncate">
          Simulation Prototype — independent concept for demonstration. Not an official Razorpay product and not connected to live production payment systems.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onOpenFaq && (
          <button
            onClick={onOpenFaq}
            className="text-amber-800 hover:text-amber-950 underline font-semibold text-[10px] cursor-pointer"
          >
            Reviewer FAQ
          </button>
        )}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-0.5 rounded hover:bg-amber-500/10 transition-colors cursor-pointer"
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
