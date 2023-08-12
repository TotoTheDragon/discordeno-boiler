import DiscordValidationError from "#service/structure/error/DiscordValidationError.js";
import MissingHandlerError from "#service/structure/error/MissingHandlerError.js";
import MissingParametersError from "#service/structure/error/MissingParametersError.js";
import ValidationError from "#service/structure/error/ValidationError.js";
import { Interaction } from "@discordeno/bot";

// This is just a default handler, you can replace this with your normal handler.
// You can also call this after your custom handling and this will handle all internal errors.
export async function interactionErrorHandler(err: unknown, interaction: Interaction): Promise<void> {
    try {
        if (err instanceof ValidationError) {
            await interaction.respond("ERROR: Was not able to validate your data: " + err.message)
            return;
        }

        if (err instanceof MissingParametersError) {
            await interaction.respond("ERROR: Missing parameters.")
            return;
        }

        if (err instanceof MissingHandlerError) {
            await interaction.respond("ERROR: No way to handle this interaction. Discord data might be outdated.")
            return;
        }

        if (err instanceof DiscordValidationError) {
            await interaction.respond("ERROR: Was not able to validate data we received from discord.")
            return;
        }

        console.log(err);
        await interaction.respond("An unknown error has occured.");
    } catch { }
}