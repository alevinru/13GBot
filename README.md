# 13GBot
13th Galeon ChatWars helper Telegram bot

## Prerequisites

Bot needs a connection to a [https://redis.io](Redis) database to store its data.
So you need to build and run your own Redis instance.

By default bot connects to local Redis at default port db 2. You could specify this behaviour with environment variables:
`REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`

## Setup

```Shell
git clone git@github.com:alevinru/13GBot.git

cd 13GBot

npm i

export BOT_TOKEN=Your_telegram_bot_token

npm run start
```
