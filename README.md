# Jinglebot

Jinglebot is a Discord game bot where server members compete to gift the most Animal Crossing villagers for the holiday season.

## Features

#### The main commands:

1. `j!config enable #channel-name` server owner use only, enables a channel as the only channel Jinglebot can be used in. Once run, Jinglebot will spawn villagers in the channel every few minutes
1. `j!config disable #channel-name` server owner use only, stops Jinglebot from using a previously enabled channel
1. `j!leaderboard` see up to the top 100 gifters
1. `j!profile` lets a member see their own gifted villagers

#### Demonstration:

_Main gameplay, after j!config enable has been run:_

![gameplay](https://imgur.com/ZcXyxyF.gif)

---

## Installation

Jinglebot was made exclusively for the partnered ACNH Discord server so it is not publicly available to be invited. However, you're free to clone it and host it yourself if you wish.

1. `npm i` to install all required packages
1. Create a `config.json` file with the variables listed in [sample.config.json]
1. Invite Jinglebot into your Discord server and run the `j!config enable` command inside whichever channel you want Jinglebot to spawn villagers and allow members to use the Jinglebot commands in

## Technologies Used

Jinglebot was made possible due to the following resources:

1. [Discord.js](https://discord.js.org/#/)
1. [Nookipedia API](https://api.nookipedia.com/)
1. [Google Sheets to JSON + the ACNH Item Spreadsheet](https://github.com/acdb-team/google-sheets-to-json)
