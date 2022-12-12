const TelegramBot = require("node-telegram-bot-api");

const { RU, UA, EN, PL } = require("./translations");
const BIBLE = require("./bibleTexts.json");
const CONF = require("./conf");

const bot = new TelegramBot(CONF.token, { polling: true });
const BIBLE_PARSE = JSON.parse(JSON.stringify(BIBLE));

let CURRENT_LANGUAGE = RU;
let CURRENT_LANGUAGE_PREFIX = "RU";

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

// set app language
const setLanguage = (code) => {
  CURRENT_LANGUAGE_PREFIX = code.toUpperCase();
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

// return main app menu
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
      [{ text: CURRENT_LANGUAGE.mainMenu.feedback }],
    ],
    resize_keyboard: true,
  }),
});

// check app menu command
const checkMainMenu = async (chatId, text) => {
  switch (text) {
    case CURRENT_LANGUAGE.mainMenu.donation: {
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.donation.recipient);
      await bot.sendMessage(chatId, CONF.donation.recipient);
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.donation.number);
      await bot.sendMessage(chatId, CONF.donation.number);
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.donation.title);
      return bot.sendMessage(chatId, CONF.donation.title);
    }
    case CURRENT_LANGUAGE.mainMenu.feedback: {
      return bot.sendMessage(
        chatId,
        `${CURRENT_LANGUAGE.ourFeedback}\n${CONF.urls.feedback}`,
        { disable_web_page_preview: true }
      );
    }
    case CURRENT_LANGUAGE.mainMenu.churchInfo: {
      await bot.sendPhoto(chatId, CONF.urls.churchInfo, {
        caption: `${CURRENT_LANGUAGE.churchInfo}`,
      });
      return bot.sendMessage(
        chatId,
        `${CURRENT_LANGUAGE.pastorsInfo.moreInfo}\n${CONF.urls.church}`,
        { disable_web_page_preview: true }
      );
    }
    case CURRENT_LANGUAGE.mainMenu.churchChat: {
      return bot.sendMessage(
        chatId,
        `
      ${CURRENT_LANGUAGE.followUs}
      \n${CURRENT_LANGUAGE.viber}: ${CONF.urls.viberOffer}
      \n${CURRENT_LANGUAGE.telegram}: ${CONF.urls.telegaOffer}
      \n${CURRENT_LANGUAGE.instagram}: ${CONF.urls.instagramOffer}`,
        {
          disable_web_page_preview: true,
        }
      );
    }
    case CURRENT_LANGUAGE.mainMenu.events: {
      await bot.sendPhoto(chatId, CONF.urls.homeGroupPhoto, {
        caption: `${CURRENT_LANGUAGE.homeGroup}${CONF.homeGroup.address}`,
      });
      return bot.sendMessage(
        chatId,
        `${CURRENT_LANGUAGE.moreEvents}\n${CONF.urls.insta}`
      );
    }
    case CURRENT_LANGUAGE.mainMenu.churchLeaders: {
      await bot.sendPhoto(chatId, CONF.info.pastor_1.photo, {
        caption: `${CURRENT_LANGUAGE.pastorsInfo.title}\n${CONF.info.pastor_1.name}\n${CURRENT_LANGUAGE.pastorsInfo.tel}${CONF.info.pastor_1.tel}`,
      });
      await bot.sendPhoto(chatId, CONF.info.pastor_2.photo, {
        caption: `${CURRENT_LANGUAGE.pastorsInfo.title}\n${CONF.info.pastor_2.name}\n${CURRENT_LANGUAGE.pastorsInfo.tel}${CONF.info.pastor_2.tel}`,
      });
      return bot.sendMessage(
        chatId,
        `${CURRENT_LANGUAGE.pastorsInfo.moreInfo}\n${CONF.urls.church}`,
        { disable_web_page_preview: true }
      );
    }
    case CURRENT_LANGUAGE.mainMenu.liveStream: {
      return bot.sendMessage(
        chatId,
        `${CURRENT_LANGUAGE.youtubeInfo}\n${CONF.urls.youtube}`,
        { disable_web_page_preview: true }
      );
    }
    default:
      await bot.sendMessage(chatId, CURRENT_LANGUAGE.notFound);
  }
};

// show text from json
const initMessageInterval = (chatId) => {
  const showBibleText = () => {
    const text = BIBLE_PARSE[CURRENT_LANGUAGE_PREFIX][intervalTextIndex];

    text
      ? bot
          .sendMessage(
            chatId,
            BIBLE_PARSE[CURRENT_LANGUAGE_PREFIX][intervalTextIndex]
          )
          .then(() => intervalTextIndex++)
      : clearTimeout(myInterval);
  };

  const myInterval = setInterval(showBibleText, 86400000);
  let intervalTextIndex = 0;
};

// init app
const start = (firstMsg) => {
  // set commands as settings
  bot.setMyCommands([
    {
      command: "/language",
      description: "сменить язык",
    },
  ]);

  // message handler
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    //set current language
    if (firstMsg) {
      CURRENT_LANGUAGE = setLanguage(msg.from.language_code);
      setTimeout(() => initMessageInterval(chatId), 60000);
      firstMsg = false;
    }

    switch (text) {
      case "/start": {
        return bot.sendMessage(chatId, CURRENT_LANGUAGE.welcome, getMainMenu());
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

  // handler for commands settings
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
  });
};

start(true);
