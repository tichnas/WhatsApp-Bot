const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const P = require("pino");

class Bot {
  #socket;
  #messageStore = {};
  #emptyChar = "‎ ";
  #authFolder;
  #selfReply;
  #saveCredentials;
  #logMessages;
  #plugins;

  constructor(plugins = [], config = {}) {
    this.#plugins = plugins;

    this.#authFolder = config.authFolder || "auth";
    this.#selfReply = config.selfReply || false;
    this.#logMessages = config.logMessages || true;
  }

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(this.#authFolder);

    this.#saveCredentials = saveCreds;

    this.#socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      getMessage: this.#getMessageFromStore,
      logger: P({ level: "error" }),
      downloadHistory: false,
    });

    this.#plugins.forEach((plugin) =>
      plugin.init(this.#socket, this.#getText, this.#sendMessage)
    );
  }

  async run() {
    this.#socket.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
          // reconnect if not logged out
          if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.loggedOut
          ) {
            console.log("Connection closed. You are logged out.");
          } else if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.timedOut
          ) {
            console.log(
              new Date().toLocaleTimeString(),
              "Timed out. Will retry in 1 minute."
            );
            setTimeout(this.#restart.bind(this), 60 * 1000);
          } else {
            this.#restart();
          }
        }
      }

      if (events["creds.update"]) {
        await this.#saveCredentials();
      }

      if (events["messages.upsert"]) {
        const { messages } = events["messages.upsert"];

        if (this.#logMessages) console.log("msg upsert", messages);

        messages.forEach(async (msg) => {
          const { key, message } = msg;

          if (!message || this.#getText(key, message).includes(this.#emptyChar))
            return;

          this.#plugins.forEach((plugin) => plugin.process(key, message));
        });
      }
    });
  }

  async #restart() {
    await this.connect();
    await this.run();
  }

  #getMessageFromStore = (key) => {
    const { id } = key;
    if (this.#messageStore[id]) return this.#messageStore[id].message;
  };

  #getText(key, message) {
    try {
      let text = message.conversation || message.extendedTextMessage.text;

      if (key.participant) {
        const me = key.participant.slice(0, 12);
        text = text.replace(/\@me\b/g, `@${me}`);
      }

      return text;
    } catch (err) {
      return "";
    }
  }

  #sendMessage = async (jid, content, ...args) => {
    try {
      if (!this.#selfReply) content.text = content.text + this.#emptyChar;

      const sent = await this.#socket.sendMessage(jid, content, ...args);
      this.#messageStore[sent.key.id] = sent;
    } catch (err) {
      console.log("Error sending message", err);
    }
  };
}

module.exports = Bot;
