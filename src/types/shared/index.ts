export const CHANNELS_LIST = {
  gmail: "Gmail",
  discord: "Discord",
  slack: "Slack",
} as const;

export type Channel = keyof typeof CHANNELS_LIST;
