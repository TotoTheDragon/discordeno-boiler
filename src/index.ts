import { Argument } from "./structure/argument.js";
import { Builder } from "./structure/builder.js";
import { ClassFields, IfEquals } from "./structure/typeUtil.js";
import { Command } from "./structure/command.js";
import { ApplicationCommandOptionTypes } from "@discordeno/bot";

const b = Command.builder()
    .name("test")
    .description("blabla")
    .option(a => a.name("x").description("").type(ApplicationCommandOptionTypes.Attachment))
    .option(a => a.name("x2").description("a").type(2))
    .execute(() => {

    })
    ;
console.log(b.build());