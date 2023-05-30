# WhatsApp Bot

## Getting Started

### Requirements

The app uses [Docker](https://www.docker.com/), so that's the only requirement.

### Build

- Run `bash build.sh` in the project root folder.

### Starting the Bot

- Run `bash run.sh` in the project root folder.
- When starting first time, you'll need to scan QR shown on terminal from your WhatsApp.

## Available Plugins

### Mirror

- Bot will reply to any message in the format `!mirror!<message>` with `<message>`.
- Just for fun, can also be used to check if the Bot is running or not.

### TagEveryone

- Bot will reply to any message containing the word `@all` (case insensitive) and tag all the members in the group.
- To avoid spam, this will work only in groups having < 100 members.
- No usecase in personal conversations.

### Roles

- Ability to create custom roles (like in Discord) to tag a specific set of members in a group.
- You can list roles, create new roles, delete roles and add or remove members from role.
- Message `!role help` to learn how to use the functionalities.
  - You can do `@me` to simulate tagging yourself.
- Bot will reply to any message containing the word `@<role>` (case insensitive), where `<role>` can be any role created and tag all the members of that role.
- `NOTE`: Roles currently span across groups and chats. So one role can contain members from multiple group (and yes, you'll be able to tag people from other groups without them knowing!).
  - Everyone who is able to chat with your Bot will be able to change any data (of any role) by using the role commands.
  - Maybe improve this by creating an issue and opening a PR :)

## Configuration

Some functionality of the Bot & plugins can be changed without code through `config.js`.

### Bot Configuration

- `authFolder`: Represents the name of directory (in the project root) that will contain:

  - authentication details of your WhatsApp (so that you don't need to scan the QR everytime)
  - Details about last processed message. When the Bot starts again, all messages after the last processed message will be processed.
  - `NOTE`: It contains private data, DO NOT share it.

- `selfReply`: If `false`, the bot will not reply to its own messages.

  - Be careful if turning it to `true`, as it can be exploited to make the Bot keep sending messages in loop.

- `logMessages`: If `true`, each message that your Bot recieves will be logged on to the console.

  - Can also help you read messages without the Blue Tick ;)

### Plugins Configuration

- Mirror

  - `prefix`: Mirror the messages that start with the given prefix.

- Tag Everyone

  - `membersLimit`: Since tag everyone can be easily used to spam, the plugin won't trigger if the number of members in the group is more than the given limit.
  - `trigger`: Tag everyone whenever someone tags the trigger keyword (@\<trigger\>).

- Roles

  - `dataFiles`: Represents the name of file (in the project root) to store all data related to roles.
  - `prefix`: All role commands (excluding role tagging) must start with the given prefix.
  - `updateOnAdd`: If `true`, the Bot will send a message (in the chat where the command is given) on adding each member in any given role.
  - `updateOnRemove`: If `true`, the Bot will send a message (in the chat where the command is given) on removing each member in any given role.

> Feel free to create issues, open PRs and contribute :)
