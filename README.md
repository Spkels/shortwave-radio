# Discord.FM Shortwave Radio Bot
That stupid bot that plays those stupid tunes in that not-so-stupid Discord server.

A lot of the tracks in this bot are recordings of shortwave numbers stations, hence the name of this repository. These recordings are taken from The Conet Project, which can be found over on [archive.org](https://archive.org/details/ird059 "The Contet Project on archive.org"). Any files in the audio folder (`src/audio`) with a name starting with `tcp` are recordings from The Conet Project. The Conet Project is licensed under the [Free Music Philosophy License](https://irdial.com/free_and_easy.htm).

### Install
To install, pull the code and run `npm install` in the directory.
You need `build-essential` (or equivalent) on Linux to install, or MSBuild on Windows.

You also need a load of environment variables to configure the bot, you can see the list [in the code](https://github.com/DiscordFM/shortwave-radio/blob/master/src/bot.js#L12 "bot.js env declarations").

### Contributing
Just fork, make your changes on your fork, and then submit a pull request to the `master` branch on this repository.
If you're adding a track to the repo, just add it into the `src/audio` file with your username and a track name, like `deansheather - some creative track name`.

### License
A copy of the MIT license can be found in `LICENSE`.
