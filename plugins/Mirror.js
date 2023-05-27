class Mirror {
  #getText;
  #sendMessage;
  #prefix;

  constructor(config = {}) {
    this.#prefix = config.prefix || "!mirror!";
  }

  init(socket, getText, sendMessage) {
    this.#getText = getText;
    this.#sendMessage = sendMessage;
  }

  process(key, message) {
    const text = this.#getText(key, message);

    if (!text.toLowerCase().startsWith(this.#prefix)) return;

    this.#sendMessage(
      key.remoteJid,
      {
        text: text.slice(this.#prefix.length),
      },
      { quoted: { key, message } }
    );
  }
}

module.exports = Mirror;
