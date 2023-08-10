import Button from "#service/structure/button/button.js";
import createClient from "#service/structure/client.js";
import Router from "#service/structure/router/router.js";
import { convertCommands, parseParameters } from "#service/structure/util.js";
import { ButtonStyles } from "@discordeno/types";
import { configDotenv } from "dotenv";
configDotenv();
const client = createClient({token: process.env.DISCORD_TOKEN!, events: {}});
await client.load();
const commands = convertCommands(Array.from(client.commands.values()));
// await client.rest
//     .upsertGuildApplicationCommands(
//         "1101828486718558289",
//         commands,
//     )
//     .catch((err) => console.log(err));
client.start();