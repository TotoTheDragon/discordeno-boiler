import { CreateOrganizationModal } from "#service/modals/organization/create.js";
import client, { Client } from "#service/structure/client.js";
import AutocompleteContext from "#service/structure/command/autocompleteContext.js";
import Command from "#service/structure/command/command.js";

const abcAutocomplete = (_client: Client, _context: AutocompleteContext) => {
    return ["1", "2", "3"];
};

export const StaffOrganizationCreateCommand = Command.builder()
    .subgroup("staff")
    .subcommand("organization")
    .name("create")
    .description("Create a new organization")
    .argument(argument => argument.string().name("abc").description("test").autocomplete(abcAutocomplete).required())
    .argument(argument => argument.boolean().name("bolo").description("test2"))
    .argument(argument => argument.integer().name("integier").description("test3"))
    .handle(async (_client: Client, context) => {
        console.log(context.arguments);
        await context.respond(
            CreateOrganizationModal.interaction(
                {
                    fieldOptions:
                    {
                        name: { placeholder: context.arguments.abc }
                    }
                }
            ));
        console.log("Create command executed");
    });
