import gmail from "@/mocks/handlers/gmail";
import discord from "@/mocks/handlers/discord";
import slack from "@/mocks/handlers/slack";

export const handlers = [
  ...Object.values(gmail),
  ...Object.values(discord),
  ...Object.values(slack),
];
