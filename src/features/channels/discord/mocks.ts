import { http, HttpResponse } from "msw";

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
    return HttpResponse.json([
      {
        id: "1234567890",
        channel_id: "9876543210",
        author: {
          id: "111222333",
          username: "lucas_dev",
          global_name: "Lucas",
        },
        content: "Hey t'es dispo pour un projet ?",
        timestamp: "2026-06-12T09:42:00.000Z",
        attachments: [],
        type: 0,
      },
    ]);
  }),
};

export default handlers;
