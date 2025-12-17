'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    window.location.href = `mailto:royaldigitalmart@gmail.com?subject=Newsletter Subscription&body=Please subscribe ${email} to your newsletter.`;
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-white/40 focus:ring-0"
        required
      />
      <Button type="submit" className="w-full bg-white text-black font-medium rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors">
        Subscribe
      </Button>
    </form>
  );
}
