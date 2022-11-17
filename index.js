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

const getMainMenu = () => ({
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
});

const checkMainMenu = async (chatId, text) => {
  switch (text) {
    case CURRENT_LANGUAGE.mainMenu.donation: {
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.donation.recipient);
      await bot.sendMessage(chatId, PERMISSIONS.donation.recipient);
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.donation.number);
      await bot.sendMessage(chatId, PERMISSIONS.donation.number);
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.donation.title);
      return bot.sendMessage(chatId, PERMISSIONS.donation.title);
    }
    case CURRENT_LANGUAGE.mainMenu.churchInfo: {
      return bot.sendMessage(chatId, "ссылка или просто текст с картинками?");
    }
    case CURRENT_LANGUAGE.mainMenu.churchChat: {
      await bot.sendMessage(chatId, PERMISSIONS.urls.viber);
      return bot.sendMessage(
        chatId,
        "ссылка / qr код в вайбер / чат в телеге закрыт"
      );
    }
    case CURRENT_LANGUAGE.mainMenu.events: {
      return bot.sendMessage(
        chatId,
        "ссылка на сайт? \n предстоящие события? \n другие опции?"
      );
    }
    case CURRENT_LANGUAGE.mainMenu.churchLeaders: {
      await bot.sendMessage(chatId, "ссылка на ютуб?");
      await bot.sendMessage(chatId, "ссылка на ютуб?");
      return bot.sendMessage(
        chatId,
        "Больше информации на сайте " + PERMISSIONS.urls.church
      );
    }
    case CURRENT_LANGUAGE.mainMenu.liveStream: {
      await bot.sendMessage(
        chatId,
        "ссылка на ютуб? \n последняя трансляция? \n другие опции?"
      );
      return bot.sendMessage(chatId, PERMISSIONS.urls.youtube);
    }
    default:
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.notFound);
  }
};

const start = (firstMsg) => {
  bot.setMyCommands([
    {
      command: "/start",
      description: "start",
    },
    {
      command: "/language",
      description: "изменить язык",
    },
  ]);

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (firstMsg) {
      CURRENT_LANGUAGE = setLanguage(msg.from.language_code);
      firstMsg = false;
    }

    switch (text) {
      case "/start": {
        await bot.sendMessage(chatId, CURRENT_LANGUAGE.welcome);
        return bot.sendMessage(
          chatId,
          CURRENT_LANGUAGE.showMainOptionsMenu,
          getMainMenu()
        );
      }

      case "/language": {
        return bot.sendMessage(
          chatId,
          CURRENT_LANGUAGE.askLanguage,
          langOption
        );
      }

      default:
        await checkMainMenu(chatId, text);
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
    }

    console.log("callback_query", data.data);
  });
};

start(true);
