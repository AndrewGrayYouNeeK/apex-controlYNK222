import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function CommandInput({ onCommand, enabled }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !enabled) return;
    onCommand(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type command... (e.g. DAL472 heading 270 descend 3000)"
        disabled={!enabled}
        className="font-mono text-xs bg-card/50 border-border/50 text-primary placeholder:text-muted-foreground/30 focus:border-primary/50"
      />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={!enabled || !text.trim()}
        className="border-border/50 text-primary hover:bg-primary/10"
      >
        <Send className="w-3 h-3" />
      </Button>
    </form>
  );
}