import { http, HttpResponse } from "msw";

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
      messages: [
        {
          type: "message",
          user: "U012AB3CD",
          text: "Salut, je t'envoie le brief",
          ts: "1718185320.000100",
        },
      ],
    });
  }),
};
export default handlers;
