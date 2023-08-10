import { Client } from "#service/structure/client.js";
import ModalSubmitContext from "#service/structure/modal/context.js";
import Modal from "#service/structure/modal/modal.js";

export const CreateOrganizationModal = Modal.builder()
    .id("organization/create")
    .title("Create organization")
    .field(field => field.id("name").label("Organization name").required())
    .field(field => field.id("email").label("Contact email"))
    .field(field => field.id("website").label("Website"))

    .handle(async (client: Client, context: ModalSubmitContext) => {
        console.log("Handle modal submit");
    });

