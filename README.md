# sylv/Jinglebot

Jinglebot is a Discord game bot where server members compete to gift the most Animal Crossing villagers for the holiday season. This fork fixes some things because I was bullied into it, below is a slightly incomplete list of the changes I've made.

- Events don't run on a fixed timer, instead they run on messageCreate then pick a random number between two configurable values and wait that amount of time before waiting for another message to st art an event.
- Guild settings are stored per-server and in a database so they persist
- Command errors are handled
- Commands can now be used by anyone, not just the server owner.
- You can select a role to be given to the person on the top of the leaderboard.
- Other improvements like how commands are registered, how errors are handled, that kinda thing.
- Reactions are removed if the user is on cooldown (aka has already reacted).
- The `config` command requires admin perms instead of owner perms
- config.json takes human readable times instead of numbers
- Status shows member count of all guilds the bot is in combined instead of just the first.

## Features

#### The main commands:

1. `j!config enable #channel-name` server owner use only, enables a channel as the only channel Jinglebot can be used in. Once run, Jinglebot will spawn villagers in the channel every few minutes
1. `j!config set-role @role` server oner use only, to set the role users will get when they reach the number one position on the leaderboard.
1. `j!config disable #channel-name` server owner use only, stops Jinglebot from using a previously enabled channel
1. `j!leaderboard` see up to the top 100 gifters
1. `j!profile` lets a member see their own gifted villagers

#### Demonstration:

_Main gameplay, after j!config enable has been run:_

![gameplay](https://imgur.com/ZcXyxyF.gif)

---

## Installation

1. For Ubuntu, do `sudo apt update && sudo apt install docker.io docker-compose git && sudo systemctl enable docker`. Other systems you'll likely have to manually install git, [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/).
1. `git clone https://github.com/sylv/Jinglebot.git`
1. `cd Jinglebot`
1. `cp sample.config.json config.json`
1. Fill out config.json
1. `docker-compose up -d`

I'd also recommend you ditch the mongo instance provided by the docker-compose file (`docker-compose down`, comment it out, `docker-compose up -d`) and use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) because it comes with replication, automatic backups, is completely free and is generally much less a pain in the ass.

## Technologies Used

Jinglebot was made possible due to the following resources:

1. [Discord.js](https://discord.js.org/#/)
1. [Nookipedia API](https://api.nookipedia.com/)
1. [Google Sheets to JSON + the ACNH Item Spreadsheet](https://github.com/acdb-team/google-sheets-to-json)
