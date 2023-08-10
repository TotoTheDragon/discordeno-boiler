import { Bot, DiscordGatewayPayload, DiscordInteraction, Interaction } from '@discordeno/bot';

export function interactionCreate(bot: Bot, data: DiscordGatewayPayload): [Interaction] {
    return [bot.transformers.interaction(bot, data.d as DiscordInteraction)];
}
