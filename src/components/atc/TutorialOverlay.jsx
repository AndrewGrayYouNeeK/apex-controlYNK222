import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MousePointerClick, Compass, ArrowDownToLine, PlaneLanding, GraduationCap, CheckCircle2, X, Radar, Tag, Mic, ShieldAlert } from 'lucide-react';

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    icon: GraduationCap,
    title: 'Welcome to the Tower',
    body: "You are an air traffic controller. Aircraft appear as small green dots (we call them \"blips\") on your radar screen. Your one job: keep every aircraft a safe distance apart, and guide the arriving ones down onto the runway in the very center of the scope.",
    bullets: [
      'Green dots = aircraft you control',
      'Center of the radar = the airport / runway',
      "We'll go through every control one tiny step at a time",
    ],
    cta: "Let's begin",
  },
  {
    id: 'radar-explainer',
    icon: Radar,
    title: 'Reading the radar',
    body: "The radar is the big round screen in the middle. A few things to notice:",
    bullets: [
      'The rings are distance markers — closer to the center means closer to the airport.',
      'The numbers around the edge (000–360) are compass directions, called "headings".',
      'A green line sweeps around like a clock hand — that is the radar scanning the sky.',
      'A short line sticking out of each blip shows which way that aircraft is flying.',
    ],
    cta: 'Got it',
  },
  {
    id: 'datablock-explainer',
    icon: Tag,
    title: "The aircraft's data tag",
    body: "Next to every blip is a little block of text. This tells you everything about that flight:",
    bullets: [
      'Top line = the callsign (the aircraft\'s name, e.g. "DAL472").',
      'Second line = altitude and speed. Altitude is shown in hundreds of feet (e.g. "050" = 5,000 ft).',
      'Third line = the aircraft type (e.g. B738 = Boeing 737).',
      'Red flashing text = an emergency — deal with those first!',
    ],
    cta: 'Makes sense',
  },
  {
    id: 'select',
    icon: MousePointerClick,
    title: 'Step 1 — Select an aircraft',
    body: "Before you can give an order, you must pick who you're talking to. Tap a green blip on the radar, OR tap one of the flight strips in the left column. The aircraft you pick will light up brighter and get a pulsing ring around it.",
    hint: '👉 Tap any aircraft now to continue…',
  },
  {
    id: 'phraseology-explainer',
    icon: Mic,
    title: 'How to talk to pilots',
    body: "You give orders by typing (bottom-right box) or using your voice. Real controllers speak numbers digit-by-digit. Don't worry — the game understands plain numbers too.",
    bullets: [
      'Say "two seven zero" OR just type "270" — both work.',
      'Always nothing fancy needed: a command + a number.',
      'The pilot will read your order back to confirm they heard it.',
    ],
    cta: 'Next',
  },
  {
    id: 'heading',
    icon: Compass,
    title: 'Step 2 — Turn the aircraft (heading)',
    body: "A \"heading\" is the compass direction you want the plane to fly (0–360). Turning aircraft is how you line them up with the runway and keep them apart. With your aircraft still selected, type a turn command:",
    example: 'turn left heading two seven zero',
    bullets: [
      '"heading 360" = fly north, "090" = east, "180" = south, "270" = west.',
      'You can say "turn left" or "turn right" to pick the direction of the turn.',
    ],
    hint: '👉 Type a heading command to continue…',
  },
  {
    id: 'altitude',
    icon: ArrowDownToLine,
    title: 'Step 3 — Change altitude',
    body: "Arriving planes are high up and must come down gradually before they can land. Altitude is given in feet. Bring your aircraft down with:",
    example: 'descend and maintain three thousand',
    bullets: [
      'Use "descend" to go down, "climb" to go up.',
      '"three thousand" = 3,000 feet. You can also just type "3000".',
      'Never bring a plane down on top of another — watch their altitudes!',
    ],
    hint: '👉 Issue a descend/climb command to continue…',
  },
  {
    id: 'separation-explainer',
    icon: ShieldAlert,
    title: 'Keeping aircraft apart',
    body: "Your most important rule: two aircraft must never get too close. If they do, the radar draws a flashing line between them and warns you (\"CA\" = Conflict Alert).",
    bullets: [
      'Fix conflicts by turning one plane away, or by changing its altitude.',
      'Two planes at different altitudes are safe even if their dots are near.',
      'Emergencies and conflicts always come first — handle them fast.',
    ],
    cta: 'Understood',
  },
  {
    id: 'land',
    icon: PlaneLanding,
    title: 'Step 4 — Clear it to land',
    body: "Once an arriving aircraft is pointed at the airport and low enough, give it the final order to land. This is called \"clearing the approach\". Type:",
    example: 'cleared ILS approach',
    bullets: [
      'Only clear a plane once it is roughly lined up with the runway and descending.',
      'After it is cleared, it will fly itself down to the runway — you earn points when it lands safely.',
    ],
    hint: '👉 Clear an aircraft for the approach to finish…',
  },
  {
    id: 'done',
    icon: CheckCircle2,
    title: "You're a controller now",
    body: "That's the whole loop, every time: SELECT a plane → TURN it (heading) → bring it DOWN (altitude) → CLEAR it to land. Keep everyone separated, handle emergencies first, and rack up points for safe landings.",
    bullets: [
      'Tap the pause button up top any time you need a breather.',
      'You can re-select a different aircraft whenever you like.',
    ],
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

          {step.bullets && (
            <ul className="mt-2 space-y-1.5">
              {step.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 font-mono text-[10px] leading-relaxed text-muted-foreground/90">
                  <span className="text-primary mt-px">›</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

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