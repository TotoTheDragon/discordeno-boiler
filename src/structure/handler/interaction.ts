import ButtonContext from "#service/structure/button/context.js";
import { Client } from "#service/structure/client.js";
import CommandContext, { AutocompleteContext } from "#service/structure/command/context.js";
import MissingHandlerError from "#service/structure/error/MissingHandlerError.js";

import ModalSubmitContext from "#service/structure/modal/context.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getCommandDataOptions, getCommandPath } from "#service/structure/util.js";
import { Interaction, InteractionTypes } from "@discordeno/bot";

export const interactionHandler = async (client: Client, interaction: Interaction) => {
    switch (interaction.type) {
        case InteractionTypes.ApplicationCommand: {
            return handleCommand(client, interaction);
        }
        case InteractionTypes.ApplicationCommandAutocomplete: {
            return handleAutocomplete(client, interaction);
        }
        case InteractionTypes.MessageComponent: {
            return handleComponent(client, interaction);
        }
        case InteractionTypes.ModalSubmit: {
            return handleModal(client, interaction);
        }
    }
};

const handleCommand = async (client: Client, interaction: Interaction) => {
    const start = performance.now();
    const commandPath = getCommandPath(interaction);
    const command = client.commands.get(commandPath);
    try {
        if (!command) {
            throw new MissingHandlerError();
        }

        const context: CommandContext<any> = command.createContext(interaction);

        await context.parseArguments(client);
        await command.execute(client, context);
        // TODO handle errors
    } finally {
        const end = performance.now();
        console.log(`Command ${commandPath} took ${end - start}ms to process`);
    }
};
const handleAutocomplete = async (client: Client, interaction: Interaction) => {
    const start = performance.now();
    const commandPath = getCommandPath(interaction);
    const command = client.commands.get(commandPath);
    try {
        if (!command) {
            throw new MissingHandlerError();
        }

        const options = getCommandDataOptions(interaction);
        console.log(options);
        const argumentName = options[0].name;

        const argument = command.getArgument(argumentName);

        if (!argument) {
            throw new MissingHandlerError();
        }

        if (!argument.autocomplete) {
            throw new MissingHandlerError();
        }

        const context: AutocompleteContext = new AutocompleteContext(interaction);

        const results = await argument.autocomplete(client, context);
        await interaction.respond({
            choices: results.map(v => {
                return {
                    name: v.toString(),
                    value: v
                }
            })
        });
        // TODO handle errors
    } finally {
        const end = performance.now();
        console.log(`Autocomplete ${commandPath} took ${end - start}ms to process`);
    }
};
const handleComponent = async (client: Client, interaction: Interaction) => {
    const start = performance.now();
    const id = interaction.data?.customId;
    if (!id) {
        return;
    }
    try {
        const [button, args] = client.buttons.find(id);
        if (!button) {
            throw new MissingHandlerError();
        }

        const context: ButtonContext<any> = new ButtonContext(interaction, args);

        // TODO change true into a property on button, so user can choose whether to automatically defer.
        await interaction.defer(true);
        await button.execute(client, context);
        // TODO handle errors
    } finally {
        const end = performance.now();
        console.log(`Button ${id} took ${end - start}ms to process`);
    }
};
const handleModal = async (client: Client, interaction: Interaction) => {
    const start = performance.now();
    const id = interaction.data?.customId;
    if (!id) {
        return;
    }
    try {
        const [modal, args] = client.modals.find(id);
        if (!modal) {
            throw new MissingHandlerError();
        }

        const context: ModalSubmitContext<KeyValueMap, KeyValueMap> = new ModalSubmitContext(modal, interaction, args);

        await interaction.defer(true);
        await context.parseArguments();
        await modal.execute(client, context);
        // TODO handle errors
    } finally {
        const end = performance.now();
        console.log(`Modal ${id} took ${end - start}ms to process`);
    }
};
