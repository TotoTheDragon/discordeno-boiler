import Command from "#service/structure/command/command.js";
import { EventHandlers, Interaction, InteractionDataOption, snakeToCamelCase } from "@discordeno/bot";
import { ApplicationCommandOptionTypes, ApplicationCommandTypes, Camelize, CreateApplicationCommand, CreateSlashApplicationCommand, DiscordApplicationCommandOption, GatewayEventNames, InteractionTypes } from "@discordeno/types";

const GATEWAY_EVENT_MAPPING: { [key in GatewayEventNames]?: keyof EventHandlers } = {
    MESSAGE_REACTION_ADD: 'reactionAdd',
    MESSAGE_REACTION_REMOVE: 'reactionRemove',
    MESSAGE_REACTION_REMOVE_EMOJI: 'reactionRemoveEmoji',
};

export function getEventName(event: GatewayEventNames): keyof EventHandlers {
    return GATEWAY_EVENT_MAPPING[event] ?? snakeToCamelCase(event.toLowerCase()) as keyof EventHandlers;
}

export function isClass(value: unknown): boolean {
    return Object.getOwnPropertyDescriptor(value, 'prototype')?.writable === false;
}

export function isInstanceOf(proto: unknown, clazz: unknown): boolean {
    if (proto == null) {
        return false;
    }
    return Object.getPrototypeOf(proto) === clazz;
}

export function convertCommands(commands: Command<any>[]): CreateSlashApplicationCommand[] {
    const arr: CreateSlashApplicationCommand[] = [];
    for (const command of commands) {
        insertApplicationCommand(command, arr);
    }
    return arr;
}


function insertApplicationCommand(command: Command<any>, commands: CreateSlashApplicationCommand[]): void {
    if (command.getSubgroup()) {
        let subGroup = commands.find(value => value.name === command.getSubgroup());
        if (!subGroup) {
            const newGroup: CreateApplicationCommand = {
                name: command.getSubgroup()!,
                type: ApplicationCommandTypes.ChatInput,
                description: "TODO",
                options: [],
            };
            commands.push(newGroup);
            subGroup = newGroup;
        };

        let subcommand = subGroup.options?.find(value => value.name === command.getSubcommand())
        if (!subcommand) {
            const newSubcommand: DiscordApplicationCommandOption = {
                type: ApplicationCommandOptionTypes.SubCommandGroup,
                name: command.getSubcommand()!,
                description: "TODO",
                options: []
            };
            subGroup.options!.push(newSubcommand);
            subcommand = newSubcommand;
        }

        subcommand.options!.push(command.asApplicationCommand() as DiscordApplicationCommandOption);
    } else if (command.getSubcommand()) {
        let subcommand = commands.find(value => value.name === command.getSubcommand())
        if (!subcommand) {
            const newSubcommand: CreateApplicationCommand = {
                type: ApplicationCommandTypes.ChatInput,
                name: command.getSubcommand()!,
                description: "TODO",
                options: [],
            };
            commands.push(newSubcommand);
            subcommand = newSubcommand;
        }

        subcommand.options!.push(command.asApplicationCommand() as DiscordApplicationCommandOption);
    } else {
        commands.push(command.asApplicationCommand() as CreateSlashApplicationCommand);
    }
}

// let data = interaction.data.as_ref()?;
// let interaction_data = extract!(data => ApplicationCommand);
// if let Some(next) = self.get_next(&interaction_data.options) {
//     let group = self.groups.get(&*interaction_data.name)?;
//     match next.value.kind() {
//         CommandOptionType::SubCommand => {
//             let subcommands = group.kind.as_simple()?;
//             subcommands.get(&*next.name)
//         }
//         CommandOptionType::SubCommandGroup => {
//             let CommandOptionValue::SubCommandGroup(options) = &next.value else {
//                 unreachable!();
//             };
//             let subcommand = self.get_next(options)?;
//             let subgroups = group.kind.as_group()?;
//             let group = subgroups.get(&*next.name)?;
//             group.subcommands.get(&*subcommand.name)
//         }
//         _ => None,
//     }
// } else {
//     self.commands.get(&*interaction_data.name)
// }
export function getCommandPath(interaction: Interaction, delimiter = "/"): string {
    if (!interaction.data) {
        throw new Error();
    }
    if (interaction.data.options?.length) {
        const group = interaction.data.options[0];
        switch (group?.type) {
            case ApplicationCommandOptionTypes.SubCommand: {
                return `${interaction.data.name}/${group.name}`;
            }
            case ApplicationCommandOptionTypes.SubCommandGroup: {
                const subcommand = group.options![0];
                return `${interaction.data.name}/${group.name}/${subcommand.name}`;
            }
            default:
                throw new Error("Invalid shit");
        }
    }
    return interaction.data.name;
}

// TODO rewrite entire function
export function getCommandOptionsByPath(
    interaction: Interaction,
    path: string,
    delimiter = "/"
): InteractionDataOption[] | undefined {
    if (
        interaction.type !== InteractionTypes.ApplicationCommand &&
        interaction.type !== InteractionTypes.ApplicationCommandAutocomplete
    ) {
        throw new Error();
    }

    if (interaction.data == null || interaction.data.name == null) {
        throw new Error();
    }

    const names: string[] = path.split(delimiter);

    // Make sure the path actually matches with the name
    if (names.shift() !== interaction.data.name) {
        return;
    }

    let data = interaction.data.options;

    while (data !== undefined && names.length > 0) {
        const currentName = names.shift();
        data = data.find((opt) => opt.name === currentName)?.options;
    }

    return data;
}

export function parseParameters(route?: string, parameters?: { [key: string]: string }, throwOnMissing = false): string | undefined {
    if (route === undefined) {
        return undefined;
    }
    // TODO in case no parameters are passed, but there are parameters, it will not throw an error. FIX that
    if (!parameters) {
        return route;
    }
    return route.replaceAll(/:([^\/]*)/g, (str) => {
        const key = str.substring(1); // Cut off the :
        if (key in parameters) {
            return parameters[key];
        }
        if (throwOnMissing) {
            throw new Error();
        }
        return str;
    })
}