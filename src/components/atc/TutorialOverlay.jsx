import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MousePointerClick, Compass, ArrowDownToLine, PlaneLanding, GraduationCap, CheckCircle2, X } from 'lucide-react';

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    icon: GraduationCap,
    title: 'Welcome to the Tower',
    body: "You're the air traffic controller. Aircraft appear as green blips on the radar. Your job: keep them apart and guide them safely to the runway in the center. Let's learn the controls — one step at a time.",
    cta: "Let's go",
  },
  {
    id: 'select',
    icon: MousePointerClick,
    title: 'Step 1 — Select an aircraft',
    body: "Tap any green blip on the radar (or a flight strip on the left) to select it. The selected aircraft glows with a pulsing ring.",
    hint: 'Waiting for you to tap an aircraft…',
  },
  {
    id: 'heading',
    icon: Compass,
    title: 'Step 2 — Turn the aircraft',
    body: "Now give it a new heading. Type a command in the box at the bottom-right, like:",
    example: 'turn left heading two seven zero',
    hint: 'Issue a heading command to continue…',
  },
  {
    id: 'altitude',
    icon: ArrowDownToLine,
    title: 'Step 3 — Change altitude',
    body: "Bring it down so it can land. Try:",
    example: 'descend and maintain three thousand',
    hint: 'Issue an altitude command to continue…',
  },
  {
    id: 'land',
    icon: PlaneLanding,
    title: 'Step 4 — Clear it to land',
    body: "Once it's lined up, clear it for the approach. Type:",
    example: 'cleared ILS approach',
    hint: 'Clear an aircraft for the approach to finish…',
  },
  {
    id: 'done',
    icon: CheckCircle2,
    title: "You're a controller now",
    body: "That's the core loop: select, vector, descend, clear to land. Traffic will keep coming — keep them separated and score points for safe landings. Good luck up there.",
    cta: 'Start controlling',
  },
];

export default function TutorialOverlay({ stepIndex, onAdvance, onSkip }) {
  const step = TUTORIAL_STEPS[stepIndex];
  if (!step) return null;

  const Icon = step.icon;
  const isInteractive = !step.cta; // steps that wait for a player action

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-end md:items-center justify-center md:justify-end p-4 md:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto w-full max-w-sm border border-primary/40 rounded bg-card/95 backdrop-blur-sm shadow-2xl shadow-primary/10 p-4 relative"
        >
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 text-muted-foreground/50 hover:text-destructive transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-primary text-glow" />
            <h3 className="font-display text-sm text-primary text-glow tracking-wider">{step.title}</h3>
          </div>

          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{step.body}</p>

          {step.example && (
            <div className="mt-2 px-3 py-2 rounded bg-primary/10 border border-primary/20">
              <span className="font-mono text-[11px] text-primary">"{step.example}"</span>
            </div>
          )}

          {/* Step progress dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {TUTORIAL_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 rounded-full transition-all ${
                  i === stepIndex ? 'w-5 bg-primary' : i < stepIndex ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            {isInteractive ? (
              <span className="font-mono text-[9px] text-accent text-glow-amber animate-pulse">{step.hint}</span>
            ) : (
              <span />
            )}
            {step.cta && (
              <Button
                size="sm"
                onClick={onAdvance}
                className="h-7 font-display tracking-wider text-[10px] bg-primary text-primary-foreground hover:bg-primary/80"
              >
                {step.cta}
              </Button>
            )}
            {isInteractive && (
              <button onClick={onSkip} className="font-mono text-[9px] text-muted-foreground/50 hover:text-primary">
                skip tutorial
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}