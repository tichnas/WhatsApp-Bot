class TagEveryone {
  #socket;
  #getText;
  #sendMessage;
  #membersLimit;
  #trigger;

  constructor(config = {}) {
    this.#membersLimit = config.membersLimit || 100;
    this.#trigger = config.trigger || "all";
  }

  init(socket, getText, sendMessage) {
    this.#socket = socket;
    this.#getText = getText;
    this.#sendMessage = sendMessage;
  }

  async process(key, message) {
    const text = this.#getText(key, message);

    if (!text.toLowerCase().includes("@" + this.#trigger)) return;

    try {
      const grp = await this.#socket.groupMetadata(key.remoteJid);
      const members = grp.participants;

      const mentions = [];
      const items = [];

      members.forEach(({ id, admin }) => {
        mentions.push(id);
        items.push("@" + id.slice(0, 12) + (admin ? " 👑 " : ""));
      });

      if (members.length < this.#membersLimit)
        this.#sendMessage(
          key.remoteJid,
          { text: `[${this.#trigger}] ${items.join(", ")}`, mentions },
          { quoted: { key, message } }
        );
    } catch (err) {
      console.log("ERROR in TagEveryone:", err);
    }
  }
}

module.exports = TagEveryone;
