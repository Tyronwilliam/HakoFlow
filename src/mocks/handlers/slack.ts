import { http, HttpResponse } from "msw";
import slackMessages from "@/mocks/data/slack.json";

const handlers = {
  getSlackChannel: http.get("https://slack.com/api/conversations.list", () => {
    return HttpResponse.json({
      ok: true,
      channels: [{ id: "D012AB3CD", is_im: true, user: "U012AB3CD" }],
    });
  }),

  getSlackMessages: http.get("https://slack.com/api/conversations.history", () => {
    return HttpResponse.json({
      ok: true,
      messages: slackMessages,
    });
  }),
};

export default handlers;
