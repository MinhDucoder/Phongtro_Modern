/* eslint-disable no-undef */
class ChatClient {
  constructor({ serverUrl, logElementId }) {
    this.serverUrl = serverUrl;
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

    this.socket.on("disconnect", (reason) => {
      this.log(`❌ Disconnected (${reason})`);
    });

    this.socket.on("connect_error", (err) => {
      this.log(`❌ Connect error: ${err && err.message ? err.message : err}`);
    });

    this.socket.on("error", (err) => {
      this.log(`❌ Error: ${err}`);
    });

    // IMPORTANT: server emits "receiveMessage"
    this.socket.on("receiveMessage", (msg) => {
      const convId = msg.conversationId ? msg.conversationId.toString() : "unknown";
      const from = msg.sender;
      const text = msg.text || (msg.attachments && msg.attachments.length ? "[attachment]" : "");
      if (convId === this.currentConversationId) {
        this.log(`💬 (${convId}) ${from}: ${text}`);
      } else {
        this.log(`🔔 (${convId}) New from ${from}: ${text}`);
      }
      this.lastMessageId = msg._id;
    });

    // server emits { messageId, userId, status }
    this.socket.on("messageSeen", ({ messageId, userId, status }) => {
      this.log(`👁 Message ${messageId} seen by ${userId}${status ? ` (${status})` : ""}`);
    });
  }

  // openConversation: ask server to find or create conversation with other user
  openConversation(otherUserId) {
    if (!this.socket) return this.log("⚠️ Socket not connected");
    if (!otherUserId) return this.log("⚠️ otherUserId is required");

    this.socket.emit("openConversation", { otherUserId }, (resp) => {
      if (!resp) return this.log("❌ No response from server");
      if (resp.success) {
        const conv = resp.conversation;
        this.currentConversationId = conv._id || conv.id || String(conv);
        this.currentReceiverId = otherUserId;
        this.log(`👉 Opened conversation ${this.currentConversationId} with ${otherUserId}`);

        if (Array.isArray(resp.messages) && resp.messages.length) {
          this.log("── previous messages ──");
          resp.messages.forEach((m) => {
            const text = m.text || (m.attachments && m.attachments.length ? "[attachment]" : "");
            this.log(`${m.sender}: ${text} (${new Date(m.createdAt).toLocaleString()})`);
          });
          this.log("──────────────────────");
        } else {
          this.log("No previous messages");
        }
      } else {
        this.log(`❌ openConversation error: ${resp.error}`);
      }
    });
  }

  // join room explicitly (server expects { conversationId })
  joinConversation(conversationId) {
    if (!this.socket) return this.log("⚠️ Socket not connected");
    if (!conversationId) return this.log("⚠️ conversationId is required");

    this.socket.emit("joinConversation", { conversationId }, (resp) => {
      if (resp && resp.success) {
        this.currentConversationId = conversationId.toString();
        this.log(`👉 Joined conversation: ${conversationId}`);
      } else {
        this.log(`❌ Join error: ${resp ? resp.error : "no response"}`);
      }
    });
  }

  // sendMessage expects payload { conversationId, receiver, text, attachments }
  sendMessage({ text, receiverId, attachments = [] }) {
    if (!this.socket) return this.log("⚠️ Socket not connected");
    if (!this.currentConversationId) return this.log("⚠️ Join or open a conversation first");

    const payload = {
      conversationId: this.currentConversationId,
      receiver: receiverId || this.currentReceiverId,
      text,
      attachments,
    };

    if (!payload.receiver) return this.log("⚠️ Receiver is required");

    this.socket.emit("sendMessage", payload, (resp) => {
      if (resp && resp.success) {
        this.lastMessageId = resp.messageId;
        this.currentReceiverId = payload.receiver;
        this.log(`✅ Message sent (id: ${resp.messageId})`);
      } else {
        this.log(`❌ Send error: ${resp ? resp.error : "no response"}`);
      }
    });
  }

  // mark message seen: server expects { messageId, conversationId }
  markSeen(messageId) {
    if (!this.socket) return this.log("⚠️ Socket not connected");

    const targetId = messageId || this.lastMessageId;
    if (!targetId) return this.log("⚠️ No messageId available to mark seen");
    if (!this.currentConversationId) return this.log("⚠️ conversationId is required to mark seen");

    this.socket.emit(
      "messageSeen",
      { messageId: targetId, conversationId: this.currentConversationId },
      (resp) => {
        if (resp && resp.success) {
          this.log(`👁 Seen message: ${targetId}`);
        } else {
          this.log(`❌ Seen error: ${resp ? resp.error : "no response"}`);
        }
      }
    );
  }
}

// export global for index.html usage
window.ChatClient = ChatClient;
