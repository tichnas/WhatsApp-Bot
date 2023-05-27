const fs = require("fs/promises");

class Roles {
  #getText;
  #sendMessage;
  #dataFile;
  #prefix;
  #updateOnAdd;
  #updateOnRemove;

  constructor(config = {}) {
    this.#dataFile = config.dataFile || "./roles.json";
    this.#prefix = config.prefix || "!role ";
    this.#updateOnAdd = config.updateOnAdd || false;
    this.#updateOnRemove = config.updateOnRemove || false;
  }

  init(socket, getText, sendMessage) {
    this.#getText = getText;
    this.#sendMessage = sendMessage;
  }

  #rolesHelp(key, message) {
    this.#sendMessage(
      key.remoteJid,
      {
        text: `[ROLE HELP]\n
        Creating role: !role create <role1> <role2>
        Deleting role: !role delete <role1> <role2>
        Listing all roles: !role list
        Adding members to role: !role <role> add <tag member 1> <tag member 2>
        Removing members from role: !role <role> remove <tag member 1> <tag member 2>\n
        Yup, that's all :)
        `,
      },
      { quoted: { key, message } }
    );
  }

  #listRoles(key, message, roles) {
    this.#sendMessage(
      key.remoteJid,
      { text: `[All Roles] ${Object.keys(roles).join(", ")}` },
      { quoted: { key, message } }
    );
  }

  #createRoles(key, message, roles, newRoles) {
    newRoles.forEach((role) => {
      if (Object.keys(roles).includes(role)) {
        this.#sendMessage(
          key.remoteJid,
          {
            text: `[${role}] Role already exists.`,
          },
          { quoted: { key, message } }
        );
      } else {
        roles[role] = [];
        this.#sendMessage(
          key.remoteJid,
          { text: `[${role}] Role created.` },
          { quoted: { key, message } }
        );
      }
    });
  }

  #deleteRoles(key, message, roles, rolesToDelete) {
    rolesToDelete.forEach((role) => {
      if (!Object.keys(roles).includes(role)) {
        this.#sendMessage(
          key.remoteJid,
          {
            text: `[${role}] Role doesn't exists.`,
          },
          { quoted: { key, message } }
        );
      } else {
        delete roles[role];
        this.#sendMessage(
          key.remoteJid,
          { text: `[${role}] Role deleted.` },
          { quoted: { key, message } }
        );
      }
    });
  }

  #addMembers(key, message, roles, role, members) {
    if (!Object.keys(roles).includes(role)) {
      this.#sendMessage(
        key.remoteJid,
        {
          text: `[${role}] Role doesn't exists.`,
        },
        { quoted: { key, message } }
      );

      return;
    }

    members.forEach((member) => {
      if (roles[role].includes(member)) {
        this.#sendMessage(
          key.remoteJid,
          {
            text: `[${role}] @${member} already a part of role.`,
            mentions: [`${member}@s.whatsapp.net`],
          },
          { quoted: { key, message } }
        );
      } else {
        roles[role].push(member);

        if (this.#updateOnAdd)
          this.#sendMessage(
            key.remoteJid,
            {
              text: `[${role}] Added @${member}.`,
              mentions: [`${member}@s.whatsapp.net`],
            },
            { quoted: { key, message } }
          );
      }
    });
  }

  #removeMembers(key, message, roles, role, members) {
    if (!Object.keys(roles).includes(role)) {
      sendMessage(
        key.remoteJid,
        {
          text: `[${role}] Role doesn't exists.`,
        },
        { quoted: { key, message } }
      );

      return;
    }

    members.forEach((member) => {
      if (!roles[role].includes(member)) {
        sendMessage(
          key.remoteJid,
          {
            text: `[${role}] @${member} not a part of role.`,
            mentions: [`${member}@s.whatsapp.net`],
          },
          { quoted: { key, message } }
        );
      } else {
        roles[role] = roles[role].filter((m) => m !== member);

        if (this.#updateOnRemove)
          this.#sendMessage(
            key.remoteJid,
            {
              text: `[${role}] Removed @${member}.`,
              mentions: [`${member}@s.whatsapp.net`],
            },
            { quoted: { key, message } }
          );
      }
    });
  }

  async process(key, message) {
    let text = this.#getText(key, message).toLowerCase();

    const rolesData = await fs.readFile(this.#dataFile);
    const roles = JSON.parse(rolesData);

    for (let role in roles) {
      if (!text.includes(`@${role}`)) continue;

      const mentions = [];
      const items = [];

      for (let member of roles[role]) {
        mentions.push(`${member}@s.whatsapp.net`);
        items.push(`@${member}`);
      }

      await this.#sendMessage(
        key.remoteJid,
        { text: `[${role}] ${items.join(", ")}`, mentions },
        { quoted: { key, message } }
      );
    }

    if (!text.startsWith(this.#prefix)) return;
    text = text.slice(this.#prefix.length).toLowerCase();

    const items = text.split(" ");

    if (items[0] === "help") {
      this.#rolesHelp(key, message);
    } else if (items[0] === "list") {
      this.#listRoles(key, message, roles);
    } else if (items[0] === "create") {
      this.#createRoles(key, message, roles, items.slice(1));
    } else if (items[0] === "delete") {
      this.#deleteRoles(key, message, roles, items.slice(1));
    } else if (items[1] === "add") {
      this.#addMembers(
        key,
        message,
        roles,
        items[0],
        items.slice(2).map((item) => item.slice(1))
      );
    } else if (items[1] === "remove") {
      this.#removeMembers(
        key,
        message,
        roles,
        items[0],
        items.slice(2).map((item) => item.slice(1))
      );
    }

    await fs.writeFile(this.#dataFile, JSON.stringify(roles));
  }
}

module.exports = Roles;
