const TelegramBot = require("node-telegram-bot-api");
const { RU, UA, EN, PL } = require("./tranlsations");
const PERMISSIONS = require("./projects_permissions");

const bot = new TelegramBot(PERMISSIONS.token, { polling: true });

let CURRENT_LANGUAGE = RU;

const langOption = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Русский язык", callback_data: "ru" },
        { text: "Українська мова", callback_data: "ua" },
      ],
      [
        { text: "English language", callback_data: "en" },
        { text: "Polski język", callback_data: "pl" },
      ],
    ],
  }),
};

const showMainOptionsMenu = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Да", callback_data: "yes" },
        { text: "Позже", callback_data: "later" },
      ],
    ],
  }),
};

const setLanguage = (code) => {
  switch (code) {
    case "ua":
      return UA;
    case "en":
      return EN;
    case "pl":
      return PL;
    case "ru":
    default:
      return RU;
  }
};

function getMainMenu() {
  return {
    reply_markup: JSON.stringify({
      keyboard: [
        [
          { text: CURRENT_LANGUAGE.mainMenu.liveStream },
          { text: CURRENT_LANGUAGE.mainMenu.churchInfo },
          { text: CURRENT_LANGUAGE.mainMenu.donation },
        ],
        [
          { text: CURRENT_LANGUAGE.mainMenu.churchChat },
          { text: CURRENT_LANGUAGE.mainMenu.churchLeaders },
          { text: CURRENT_LANGUAGE.mainMenu.events },
        ],
      ],
      resize_keyboard: true,
    }),
  };
}

const start = () => {
  bot.setMyCommands([
    {
      command: "/start",
      description: "start",
    },
    {
      command: "/language",
      description: "изменить язык",
    },
    {
      command: "/menu",
      description: "изменить язык",
    },
  ]);

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    CURRENT_LANGUAGE = setLanguage(msg.from.language_code);

    switch (text) {
      case "/start": {
        await bot.sendMessage(chatId, CURRENT_LANGUAGE.welcome);
        return bot.sendMessage(
          chatId,
          CURRENT_LANGUAGE.showMainOptionsMenu,
          showMainOptionsMenu
        );
      }

      case "/menu": {
        return bot.sendMessage(chatId, "1", {
          reply_markup: JSON.stringify({
            keyboard: [
              [
                { text: "Прямая трансляция" },
                { text: "Информация церкви" },
                { text: "Пожертвование" },
              ],
              [
                { text: "Церковный чат" },
                { text: "Лидеры церкви" },
                { text: "wdwdwd" },
              ],
            ],
            resize_keyboard: true,
          }),
        });
      }

      case "/language": {
        return bot.sendMessage(
          chatId,
          CURRENT_LANGUAGE.askLanguage,
          langOption
        );
      }
      case "Пожертвование": {
        await bot.sendMessage(chatId, "номер");
        await bot.sendMessage(chatId, "название");
        return bot.sendMessage(chatId, "кому");
      }

      default:
        await bot.sendMessage(chatId, CURRENT_LANGUAGE.notFound);
    }
  });

  bot.on("callback_query", async (data) => {
    const chatId = data.message.chat.id;

    switch (data.data) {
      // set language
      case "ru":
      case "pl":
      case "en":
      case "ua": {
        CURRENT_LANGUAGE = setLanguage(data.data);
        return bot.sendMessage(
          chatId,
          CURRENT_LANGUAGE.setLanguage,
          getMainMenu()
        );
      }

      // show menu logic
      case "yes": {
        return bot.sendMessage(chatId, "1", getMainMenu());
      }
      case "later": {
        return bot.sendMessage(chatId, CURRENT_LANGUAGE.laterLanguageMessage);
      }
    }

    console.log("callback_query", data.data);
  });
};

start();
