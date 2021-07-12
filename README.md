# Discord-KA Interface

## Instalation

1. Clone this repo
2. Run `npm install`
3. Under root, create config.json with following values:
```json
{
  "owner": "Your name e.g. Joe",
  "ownerId": "Your Discord ID here",
  "token": "Discord token here, visit https://discord.com/developers/applications/",
  "prefix": "v!"
}
```
4. Find a logins.json file containing at least 500 KAAS keys. Refer to https://github.com/L1quidH2O/Khanacademy-Account-Generator and run Generate.js. To figure out how many keys you need to generate, refer to the following chart:

| Max Vote calls/hr | 1  | 5   | 10  | 15  | 20   | 25   | 30   |
| ----------------- | -- | --- | --- | --- | ---- | ---- | ---- |
| KAAS keys         | 500 | 500 | 500 | 750 | 1000 | 1250 | 1500 |

Copy logins.json to under root

5. Run `npm run start`
6. Invite to server - `https://discordapp.com/oauth2/authorize?&client_id=BOT_ID_HERE&scope=bot&permissions=0`
7. Type `v!ping` to make sure everything works. Join [my server](https://discord.gg/ZUumbPfvcq) if you run into any issues

## Commands
(owner-only)
- `reload` - Reload a command
- `clean [id]` - Remove all artificial votes from a KA project
- `eval [code]` - Remotely execute code from discord

(public)
- `ping` - Returns latency
- `program [id] {amount=500}` - Votes up a program with the specified ID the amount specified. Default and max is 500 per user per 30 minutes.
- `discussion [kaencrypted] {amount=100}` - Votes up a discussion post (question, answer, comment or reply) given a kaencrypted key. This can be viewed with Inspect Element. Default is 100, max is 500.
- `invite` - Get invite

## Bonus
All API-related commands are logged in bot_logs.json