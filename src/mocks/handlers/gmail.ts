import { http, HttpResponse } from "msw";
import gmailMessages from "@/mocks/data/gmail.json";

const handlers = {
  getGmailChannel: http.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", () => {
    return HttpResponse.json({
      messages: gmailMessages.map(({ id, threadId }) => ({ id, threadId })),
    });
  }),

  getGmailMessages: http.get(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/:id",
    ({ params }) => {
      const message = gmailMessages.find((item) => item.id === params.id) ?? gmailMessages[0];

      return HttpResponse.json(message);
    },
  ),
};

export default handlers;
