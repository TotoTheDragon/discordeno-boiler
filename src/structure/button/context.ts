import { KeyValueMap } from "#service/structure/typeUtil.js";
import { Interaction } from "@discordeno/bot";

export default class ButtonContext<PathParameters extends KeyValueMap> {

    readonly interaction: Interaction;
    readonly parameters!: PathParameters;

    constructor(interaction: Interaction, args: Map<string, string>) {
        this.interaction = interaction;
        this.parameters = Object.fromEntries(args) as PathParameters;
    }

}