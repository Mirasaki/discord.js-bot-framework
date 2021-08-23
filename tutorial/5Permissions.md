#### A guide explaining and showing you how to work with Discord permissions and built-in permission levels
---

> Just a quick note, the built-in permission levels are totally inspired by the [GuideBot permission system](https://github.com/AnIdiotsGuide/guidebot/blob/master/config.js.example)

By default, this framework comes with 8 different permission levels. You can view these [here](./src/handlers.permissions.js) at lines `8-88`

### A quick overview of all the permission levels
**0 / User** > The default permission level, everyone has it. This means everyone will be able to use commands which use the `User` permission level

**1 / Moderator** > Checks `true` if the member has the `KICK_MEMBERS` and `BAN_MEMBERS` Discord permissions **OR** if the member has the Moderator role declared in the /settings command

**2 / Administrator** > Checks `true` if the member has the `ADMINISTRATOR` Discord permission **OR** if the member has the Administrator role declared in the /settings command

**3 / Server Owner** > Checks `true` if `member.id` is the same as `guild.ownerId`

## NOTE: The following permission levels can be configured [here](./config/config.json)
Insert any Discord member ID into the declared empty arrays to give someone these permission levels

**4 / Bot Support** > This permissions level **should** be used to allow members with this permission level to execute `Server Owner` permission level commands in any server.

**5 / Bot Administrator** > This permission level **should** be used to allow specific people to execute system commands like `/emit` or even `/eval` (which is a very dangerous command btw)

**6 / Developer** > This should be considered your highest permission level, you should always allow developers to access **all** commands

**7 / Bot Owner** > A snowflake permission level for the Bot Owner, everyone knows you want this *you snowflake*

## Adding permission levels
You can easlily add permission levels to the config, just follow the template provided by the already-present permission levels. Permission levels will be automatically sorted before boot/start-up but keeping it organized might be the better plan for furure changes/adjustments
