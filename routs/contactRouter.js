import express from "express";

import {
    createContact,
    getMyContacts,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    replyToContact
} from "../controllers/contactController.js";


const contactRouter = express.Router();


// Customer
contactRouter.post("/", createContact);

// Logged-in customer gets own messages
contactRouter.get("/my-messages", getMyContacts);


// Admin
contactRouter.get("/", getAllContacts);

contactRouter.get("/:id", getContactById);

contactRouter.put("/:id/status", updateContactStatus);

contactRouter.post("/:id/reply", replyToContact);

contactRouter.delete("/:id", deleteContact);



export default contactRouter;