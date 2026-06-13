import { http, HttpResponse } from "msw";
import discordMessages from "@/mocks/data/discord.json";

const handlers = {
  getDiscordChannel: http.get("https://discord.com/api/v10/users/@me/channels", () => {
    return HttpResponse.json([
      {
        id: "9876543210",
        type: 1,
        recipients: [{ id: "111222333", username: "lucas_dev", global_name: "Lucas" }],
        last_message_id: "1234567890",
      },
    ]);
  }),

  getDiscordMessages: http.get("https://discord.com/api/v10/channels/:id/messages", () => {
    return HttpResponse.json(discordMessages);
  }),
};

export default handlers;
