/* eslint-disable no-undef */
class ChatClient {
  constructor({ serverUrl, logElementId }) {
    this.serverUrl = serverUrl;
    // eslint-disable-next-line no-undef
    this.logElement = document.getElementById(logElementId);
    this.socket = null;

    // state
    this.currentConversationId = null;
    this.currentReceiverId = null;
    this.lastMessageId = null;
  }

  log(message) {
    const el = document.createElement("div");
    el.textContent = message;
    this.logElement.appendChild(el);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  connect(token) {
    this.socket = io(this.serverUrl, {
      auth: { token },
    });

    this.socket.on("connect", () => {
      this.log(`✅ Connected: ${this.socket.id}`);
    });

    this.socket.on("disconnect", () => {
      this.log("❌ Disconnected");
    });

    this.socket.on("error", (err) => {
      this.log(`❌ Error: ${err}`);
    });

    // message events
    this.socket.on("newMessage", (msg) => {
      this.log(`💬 New message from ${msg.sender}: ${msg.text}`);
      this.lastMessageId = msg._id;
    });

    this.socket.on("messageSeen", ({ messageId, userId }) => {
      this.log(`👁 Message ${messageId} seen by ${userId}`);
    });
  }

  joinConversation(conversationId) {
    if (!this.socket) return this.log("⚠️ Socket not connected");
    this.currentConversationId = conversationId;

    this.socket.emit("joinConversation", conversationId, (resp) => {
      if (resp.success) {
        this.log(`👉 Joined conversation: ${conversationId}`);
      } else {
        this.log(`❌ Join error: ${resp.error}`);
      }
    });
  }

  sendMessage({ text, receiverId }) {
    if (!this.socket) return this.log("⚠️ Socket not connected");
    if (!this.currentConversationId)
      return this.log("⚠️ Join a conversation first");

    const payload = {
      conversationId: this.currentConversationId,
      receiver: receiverId || this.currentReceiverId,
      text,
      attachments: [],
    };

    this.socket.emit("sendMessage", payload, (resp) => {
      if (resp.success) {
        this.lastMessageId = resp.messageId;
        this.currentReceiverId = payload.receiver;
        this.log(`✅ Message sent (id: ${resp.messageId})`);
      } else {
        this.log(`❌ Send error: ${resp.error}`);
      }
    });
  }

  markSeen(messageId) {
    if (!this.socket) return this.log("⚠️ Socket not connected");
    if (!messageId && !this.lastMessageId) {
      return this.log("⚠️ No messageId available to mark seen");
    }

    const targetId = messageId || this.lastMessageId;
    this.socket.emit("messageSeen", targetId, (resp) => {
      if (resp.success) {
        this.log(`👁 Seen message: ${targetId}`);
      } else {
        this.log(`❌ Seen error: ${resp.error}`);
      }
    });
  }
}

// export global
window.ChatClient = ChatClient;
