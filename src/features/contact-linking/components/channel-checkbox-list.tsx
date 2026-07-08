"use client";

import { Label } from "@/components/ui/label";
import { LinkableChannel } from "@/features/contact-linking/adapters";

interface ChannelCheckboxListProps {
  channels: LinkableChannel[];
  selectedIds: string[];
  onToggle: (channelId: string) => void;
}

export function ChannelCheckboxList({ channels, selectedIds, onToggle }: ChannelCheckboxListProps) {
  return (
    <div className="space-y-1.5">
      <Label>Canaux à rattacher</Label>
      <div className="space-y-2">
        {channels.map((channel) => (
          <label key={channel.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedIds.includes(channel.id)}
              onChange={() => onToggle(channel.id)}
            />
            {channel.provider} — {channel.displayHandle ?? channel.externalId}
          </label>
        ))}
      </div>
    </div>
  );
}
