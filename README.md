# fitbot
[Slack](https://slack.com/) integrated FitBot written in [node](https://nodejs.org/en/) using [botkit](http://howdy.ai/botkit/).

## Run Local

[Get node running on your machine.](https://nodejs.org/en/download/package-manager/)

Then create an empty .js file on your machine.  Enter the following code into the .js file.  

```javascript
var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: my_slack_bot_token // <-- make sure you replace this!
})
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});
```

Fowllow these [docs](http://howdy.ai/botkit/docs/) for an understanding of how to build your slack integrated bot in node using botkit.

Once your bot is on your local disk you can run it by opening up a terminal/console and changing director into the directory that contains your .js file.  Then type node and the file name you are running.

```
node bot
```

