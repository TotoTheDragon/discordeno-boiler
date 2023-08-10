import Command from "#service/structure/command/command.js";
import DiscordValidationError from "#service/structure/error/DiscordValidationError.js";
import MissingParameterError from "#service/structure/error/MissingParametersError.js";
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

export function getCommandPath(interaction: Interaction): string {
    if (!interaction.data) {
        throw new DiscordValidationError();
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
        }
    }
    return interaction.data.name;
}

export function getCommandDataOptions(interaction: Interaction): InteractionDataOption[] {
    if (
        interaction.type !== InteractionTypes.ApplicationCommand &&
        interaction.type !== InteractionTypes.ApplicationCommandAutocomplete
    ) {
        throw new DiscordValidationError();
    }

    if (!interaction.data) {
        throw new DiscordValidationError();
    }

    if (interaction.data.options) {
        const option = interaction.data.options[0];
        switch (option.type) {
            case ApplicationCommandOptionTypes.SubCommand: {
                return option.options || [];
            }
            case ApplicationCommandOptionTypes.SubCommandGroup: {
                return option.options?.[0].options || [];
            }
            default: {
                return interaction.data.options
            }
        }
    }

    return [];
}

export function getCommandAnswers(interaction: Interaction): Map<string, unknown> {
    return new Map(getCommandDataOptions(interaction).map(option => [option.name, option.value]));
}

export function getModalAnswers(interaction: Interaction): Map<string, string> {
    if (interaction.type !== InteractionTypes.ModalSubmit) {
        throw new DiscordValidationError();
    }
    if (interaction.data === undefined) {
        throw new DiscordValidationError();
    }

    return new Map(
        interaction.data.components!
            .map(component => component.components![0])
            .filter(component => component.value)
            .map(component => [component.customId!, component.value!])
    );
}


export function parseParameters(route?: string, parameters?: { [key: string]: string }, throwOnMissing = false): string | undefined {
    if (route === undefined) {
        return undefined;
    }
    return route.replaceAll(/:([^\/]*)/g, (str) => {
        if (!parameters) {
            throw new MissingParameterError();
        }
        const key = str.substring(1); // Cut off the :
        if (key in parameters) {
            return parameters[key];
        }
        if (throwOnMissing) {
            throw new MissingParameterError(key);
        }
        return str;
    })
}