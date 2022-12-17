const TelegramBot = require("node-telegram-bot-api");

const { RU } = require("./translations");
const CONF = require("./conf");

const bot = new TelegramBot(CONF.token, { polling: true });

const CURRENT_LANGUAGE = RU;

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

// init app
const start = () => {
  // message handler
  bot.setMyCommands([]);

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
      case "/start": {
        return bot.sendMessage(chatId, CURRENT_LANGUAGE.welcome, getMainMenu());
      }
      default:
        await checkMainMenu(chatId, text);
    }
  });
};

start();
