export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: GmailHeader[];
    body: { data: string; attachmentId: string }; // base64
  };
}
