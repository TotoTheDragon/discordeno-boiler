import ButtonContext from "#service/structure/button/context.js";
import { Client } from "#service/structure/client.js";
import AutocompleteContext from "#service/structure/command/autocompleteContext.js";
import CommandContext from "#service/structure/command/context.js";
import ModalSubmitContext from "#service/structure/modal/context.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getCommandOptionsByPath, getCommandPath } from "#service/structure/util.js";
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
    if (!command) {
        // TODO warning maybe
        return;
    }

    const context: CommandContext<any> = command.createContext(interaction);

    // TODO handle errors
    try {
        await context.parseArguments(client);
        await command.execute(client, context);
    } finally {
        const end = performance.now();
        console.log(`Command ${commandPath} took ${end - start}ms to process`);
    }
};
const handleAutocomplete = async (client: Client, interaction: Interaction) => {
    const start = performance.now();
    const commandPath = getCommandPath(interaction);
    const command = client.commands.get(commandPath);
    if (!command) {
        // TODO warning maybe
        return;
    }

    const options = getCommandOptionsByPath(interaction, commandPath);

    if (!options) {
        // TODO warning maybe
        return;
    }

    const argumentName = options[0].name;

    const argument = command.getArgument(argumentName);

    if (!argument) {
        // TODO warning maybe
        return;
    }

    if (!argument.autocomplete) {
        // TODO warning
        return;
    }

    // TODO generate autocomplete context
    const context: AutocompleteContext = {};

    // TODO handle errors
    try {
        const results = await argument.autocomplete(client, context);
        await interaction.respond({
            choices: results.map(v => {
                return {
                    name: v.toString(),
                    value: v
                }
            })
        })
    } finally {
        const end = performance.now();
        console.log(`Autocomplete ${commandPath} took ${end - start}ms to process`);
    }
};
const handleComponent = async (client: Client, interaction: Interaction) => { 
    const start = performance.now();
    const id = interaction.data?.customId;
    
    if(!id) {
        // TODO warning maybe
        return;
    }

    const [button, args] = client.buttons.find(id);
    if (!button) {
        // TODO warning maybe
        return;
    }

    const context: ButtonContext<any> = new ButtonContext(interaction, args);

    // TODO handle errors
    try {
        // TODO change true into a property on button, so user can choose whether to automatically defer.
        await interaction.defer(true);
        await button.execute(client, context);
    } finally {
        const end = performance.now();
        console.log(`Button ${id} took ${end - start}ms to process`);
    }
};
const handleModal = async (client: Client, interaction: Interaction) => { 
    const start = performance.now();
    const id = interaction.data?.customId;
    
    if(!id) {
        // TODO warning maybe
        return;
    }

    const [modal, args] = client.modals.find(id);
    if (!modal) {
        // TODO warning maybe
        return;
    }

    const context: ModalSubmitContext<KeyValueMap, KeyValueMap> = new ModalSubmitContext(modal, interaction, args);

    // TODO handle errors
    try {
        await interaction.defer(true);
        await context.parseArguments();
        await modal.execute(client, context);
    } finally {
        const end = performance.now();
        console.log(`Modal ${id} took ${end - start}ms to process`);
    }
};
