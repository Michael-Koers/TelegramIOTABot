const TelegramBot = require('node-telegram-bot-api');
const request = require('superagent');

// replace the value below with the Telegram token you receive from @BotFather
const token = '503503743:AAEs9vD5q3NGJ54XSH9k-WsGfuErbJw6fUE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const IOTA_API = "https://api.coinmarketcap.com/v1/ticker/iota/?convert=EUR";

const cooldown = 10 * 1000;
let time_last_updated;
let chatId;

let cryptocoin = "iota";

bot.onText(/\/start/, (msg) => {

    chatId = msg.chat.id;

    bot.sendMessage(chatId, "Welcome to the IOTA Bot! Use one of these commands to get started:" +
        "\n\n /getrate - Retrieves the current IOTA exchange rate." +
        "\n /getchange - Retrieves the change in exchange rate for the IOTA.")
});

bot.onText(/\/getchanges/, (msg) => {

        if (isOffCooldown()) {

            time_last_updated = new Date().getTime();

            request
                .get(IOTA_API)
                .end(function (err, res) {
                    if (err) {
                        bot.sendMessage(chatId, "Call to IOTA API failed... Please try again later!");
                    } else {
                        let response = res.body[0];

                        let change_1h = response.percent_change_1h;
                        let change_24h = response.percent_change_24h;
                        let change_7d = response.percent_change_7d;

                        let last_updated = new Date(response.last_updated * 1000);

                        bot.sendMessage(chatId, `Currency change in the last hour: ${change_1h}%.\nCurrency change in the past 24 hours: ${change_24h}%.\nCurrency change in the past 7 days: ${change_7d}%.\nLast Updated: ${last_updated.toUTCString()}.`);
                    }
                });
        }
    }
);

bot.onText(/\/getrate/, (msg) => {

        if (isOffCooldown()) {

            time_last_updated = new Date().getTime();

            request
                .get(IOTA_API)
                .end(function (err, res) {
                    if (err) {
                        bot.sendMessage(chatId, "Call to IOTA API failed... Please try again later!");
                    } else {
                        let response = res.body[0];

                        let price_usd = response.price_usd;
                        let price_btc = response.price_btc;
                        let price_eur = response.price_eur;

                        let last_updated = new Date(response.last_updated * 1000);

                        bot.sendMessage(chatId, `Current EUR price: €${price_eur}.\nCurrent USD price: $${price_usd}.\nCurrent Bitcoin price: ${price_btc}.\nLast Updated: ${last_updated.toUTCString()}.`);
                    }
                });
        }
    }
);


function isOffCooldown(cd = cooldown) {
    let current_time = new Date().getTime();

    if (time_last_updated != undefined && time_last_updated + cd > current_time) {
        bot.sendMessage(chatId, `IOTA API has a limit on the amount of calls that can be made. Please wait ${new Date(time_last_updated - current_time + cd).getUTCSeconds()} seconds.`);
        return false;
    } else {
        return true;
    }
}


