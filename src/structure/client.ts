import { ExecutableButton } from "#service/structure/button/button.js";
import Command from "#service/structure/command/command.js";
import { interactionErrorHandler } from "#service/structure/handler/interaction.error.js";
import { interactionHandler } from "#service/structure/handler/interaction.js";
import Modal from "#service/structure/modal/modal.js";
import Router from "#service/structure/router/router.js";
import * as transformers from "#service/structure/transformers/transformers.js";
import { getEventName } from "#service/structure/util.js";
import { Bot, CreateBotOptions, Interaction, createBot } from "@discordeno/bot";
import { EventEmitter3000 } from "eventemitter3000";
import { PathsOutput, fdir } from "fdir";
import { relative, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const basefolder = resolve(fileURLToPath(import.meta.url), '..', '..');

export type Client = Bot & {
    emitter: EventEmitter3000;

    commands: Map<string, Command<any>>,
    modals: Router<Modal<any, any>>,
    buttons: Router<ExecutableButton<any>>,

    load: () => Promise<void>;
};

export type ClientOptions = CreateBotOptions;
export type FrameworkOptions = Partial<{
    interactionErrorHandler: (err: unknown, interaction: Interaction) => Promise<void>;
}>;

export default function createClient(options: ClientOptions, frameworkOptions?: FrameworkOptions): Client {
    const bot = createBot(options);
    setDesiredProperties(bot);

    const emitter = new EventEmitter3000();
    const client = Object.assign(bot, { emitter });

    client.events.raw = async (data, shard) => {
        if (!data.t) {
            return;
        }

        const event = getEventName(data.t);
        const d = transformers[event as keyof typeof transformers]?.(bot, data) ?? [
            data.d,
        ];
        await client.emitter.asyncEmit(event, ...d, shard).catch((err: Error) => {
            console.log(err);
        });
    };



    return {
        ...client,
        commands: new Map(),
        modals: new Router(),
        buttons: new Router(),
        async load() {
            /*
                Load in default event handlers
            */
            const handleInteractionError = frameworkOptions?.interactionErrorHandler ?? interactionErrorHandler;
            this.emitter.on('interactionCreate', async (interaction: Interaction) => {
                try {
                    await interactionHandler(this, interaction);
                } catch (error) {
                    await handleInteractionError(error, interaction);
                }
            });

            /*
                Load files to handle events, commands etc...
            */
            await Promise.all([
                loadFromFolder<Command<any>>({
                    folder: `${basefolder}/commands`,
                    clazz: Command,
                    filter: (filename) => filename.endsWith('.js'),
                    foreach: (command: Command<any>) => this.commands.set(command.getFullName(), command),
                }),
                loadFromFolder<Modal<any, any>>({
                    folder: `${basefolder}/modals`,
                    clazz: Modal,
                    filter: (filename) => filename.endsWith('.js'),
                    foreach: (modal: Modal<any, any>) => this.modals.add(modal.getId(), modal),
                }),
                loadFromFolder<ExecutableButton<any>>({
                    folder: `${basefolder}/buttons`,
                    clazz: ExecutableButton,
                    filter: (filename) => filename.endsWith('.js'),
                    foreach: (button: ExecutableButton<any>) => this.buttons.add(button.getId(), button),
                })
            ]);
        }
    };
}

function setDesiredProperties(client: Bot): void {
    client.transformers.desiredProperties.interaction = {
        id: true,
        applicationId: true,
        type: true,
        guildId: true,
        channelId: true,
        member: true,
        user: true,
        token: true,
        version: true,
        message: true,
        data: true,
        locale: true,
        guildLocale: true,
        appPermissions: true,
    }
}

async function loadFromFolder<T>(options: LoadFromFolderOptions<T>) {
    const files = new fdir()
        .filter(options.filter)
        .withBasePath()
        .crawl(options.folder)
        .sync() as PathsOutput;
    console.log(
        `Found ${files.length} in folder ${relative(basefolder, options.folder)}`,
    );
    await Promise.all(
        files.map(async (file) => {
            const props = await import(pathToFileURL(file).toString());
            console.log(`Loading in values from ${relative(basefolder, file)}`);

            const classes = Object.values<T>(props)
                .filter((clazz) => clazz instanceof options.clazz);

            classes.forEach(options.foreach);
        }),
    );
}

export interface LoadFromFolderOptions<T> {
    folder: string;
    clazz: any;
    filter: (filename: string) => boolean;
    foreach: (value: T) => void;
}
