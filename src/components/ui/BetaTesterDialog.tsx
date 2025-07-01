import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Input } from "./input";
import { toast } from "sonner";

interface BetaTesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BetaTesterDialog({ open, onOpenChange }: BetaTesterDialogProps) {
  const [email, setEmail] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const handleSubmit = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const subject = '🎉 Thank You for Testing with Us!';
    const body = 
      `Hello Beta Tester,\n\n` +
      `Thank you so much for taking the time to be one of our beta testers. Your feedback and support mean a lot — it helps us make this app better for everyone.\n\n` +
      `We truly appreciate you being part of this journey with us. If you have any thoughts, ideas, or run into any issues, please don't hesitate to share — we'd love to hear from you!\n\n` +
      `Thanks again for being awesome!\n\n` +
      `Best regards,\n` +
      `Rick\n\n` +
      `---\n` +
      `Beta Tester Email: ${email}\n` +
      `Signup Date: ${new Date().toLocaleDateString()}\n` +
      (suggestions ? `\nApp Suggestions:\n${suggestions}` : '');

    // Try to copy email content to clipboard
    try {
      navigator.clipboard.writeText(body);
      toast.success('Email content copied to clipboard! Please paste it into your email client.');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }

    // Still try the mailto link as fallback
    const mailtoUrl = `mailto:RicksAppServices@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    // Close dialog after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Become a Beta Tester</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="suggestions">
              App Suggestions (up to 500 characters)
            </label>
            <Textarea
              id="suggestions"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Enter your suggestions for the app"
              maxLength={500}
            />
            <div className="text-sm text-muted-foreground text-right">
              {suggestions.length}/500
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}