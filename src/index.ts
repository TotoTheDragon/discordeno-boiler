import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import { Command } from "./structure/command.js";

const b = Command.builder()
    .name("test")
    .description("blabla")
    .option(a => a.name("x").description("").type(ApplicationCommandOptionTypes.String).build())
    .build();
typeof b;