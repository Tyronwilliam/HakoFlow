import { http, HttpResponse } from "msw";

const handlers = {
  getGmailChannel: http.get("https://gmail.googleapis.com/gmail/v1/users/me/messages", () => {
    return HttpResponse.json({
      messages: [
        { id: "18abc123", threadId: "18abc123" },
        { id: "18abc124", threadId: "18abc124" },
      ],
    });
  }),

  getGmailMessages: http.get("https://gmail.googleapis.com/gmail/v1/users/me/messages/:id", () => {
    return HttpResponse.json({
      id: "18abc123",
      threadId: "18abc123",
      snippet: "Bonjour, je voudrais un devis...",
      payload: {
        headers: [
          { name: "From", value: "Lucas <lucas@gmail.com>" },
          { name: "To", value: "toi@gmail.com" },
          { name: "Subject", value: "Devis pour site web" },
          { name: "Date", value: "Mon, 12 Jun 2026 09:42:00 +0000" },
        ],
        body: { data: "Qm9uam91ciwgamUgdm91ZHJhaXMgdW4gZGV2aXMu" },
      },
    });
  }),
};
export default handlers;
