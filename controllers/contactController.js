import Contact from "../models/contact.js";
import { isAdmin } from "./userController.js";
import nodemailer from "nodemailer";

const contactTransporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD
    }
});


// ======================================================
// CUSTOMER - SEND MESSAGE
// ======================================================

export async function createContact(req, res) {

    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body;


        if (!name || !email || !subject || !message) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        const contact = new Contact({

    name,
    email,
    subject,
    message,

    // If logged in, connect this message to the customer account
    userEmail: req.user?.email || ""

});


        await contact.save();


        res.status(201).json({
            message: "Message sent successfully"
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to send message"
        });

    }

}



// ======================================================
// ADMIN - GET ALL MESSAGES
// ======================================================

export async function getAllContacts(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(403).json({
                message: "You are not authorized"
            });

        }


        const contacts = await Contact.find()
            .sort({ createdAt: -1 });


        res.json(contacts);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to load messages"
        });

    }

}

/// ======================================================
// CUSTOMER - GET MY MESSAGES
// ======================================================

export async function getMyContacts(req, res) {

    try {

        if (req.user == null) {

            return res.status(401).json({
                message:
                    "Please login to view your messages"
            });

        }


        const contacts = await Contact.find({

            email: req.user.email.toLowerCase()

        }).sort({

            createdAt: -1

        });


        console.log(
            "Customer email:",
            req.user.email
        );

        console.log(
            "Messages found:",
            contacts.length
        );


        res.json(contacts);


    } catch (error) {

        console.error(
            "Get my contacts error:",
            error
        );


        res.status(500).json({
            message:
                "Failed to load your messages"
        });

    }
}



// ======================================================
// ADMIN - GET ONE MESSAGE
// ======================================================

export async function getContactById(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(403).json({
                message: "You are not authorized"
            });

        }


        const contact = await Contact.findById(
            req.params.id
        );


        if (!contact) {

            return res.status(404).json({
                message: "Message not found"
            });

        }


        res.json(contact);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to load message"
        });

    }

}



// ======================================================
// ADMIN - CHANGE MESSAGE STATUS
// ======================================================

export async function updateContactStatus(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(403).json({
                message: "You are not authorized"
            });

        }


        const { status } = req.body;


        const allowedStatuses = [
            "unread",
            "read",
            "replied"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid status"
            });

        }


        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                status: status
            },
            {
                new: true
            }
        );


        if (!contact) {

            return res.status(404).json({
                message: "Message not found"
            });

        }


        res.json({
            message: "Message status updated successfully",
            contact: contact
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to update message"
        });

    }

}



// ======================================================
// ADMIN - DELETE MESSAGE
// ======================================================

export async function deleteContact(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(403).json({
                message: "You are not authorized"
            });

        }


        const contact = await Contact.findByIdAndDelete(
            req.params.id
        );


        if (!contact) {

            return res.status(404).json({
                message: "Message not found"
            });

        }


        res.json({
            message: "Message deleted successfully"
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to delete message"
        });

    }

}

// ======================================================
// ADMIN - REPLY TO CUSTOMER MESSAGE
// ======================================================

export async function replyToContact(req, res) {

    try {

        // Only admin can reply
        if (!isAdmin(req)) {

            return res.status(403).json({
                message: "You are not authorized"
            });
        }


        const contactId = req.params.id;
        const adminReply = req.body.reply;


        // Check reply
        if (!adminReply || !adminReply.trim()) {

            return res.status(400).json({
                message: "Reply message is required"
            });
        }


        // Find original customer message
        const contact = await Contact.findById(contactId);


        if (!contact) {

            return res.status(404).json({
                message: "Contact message not found"
            });
        }


        // Email content
        const mailOptions = {

            from: `"Glow Guide Customer Care" <${process.env.CONTACT_EMAIL}>`,

            to: contact.email,

            subject: `Re: ${contact.subject}`,

            text:
`Hello ${contact.name},

Thank you for contacting Glow Guide.

${adminReply.trim()}

Kind regards,
Glow Guide Customer Care
Beauty at your side ♡`
        };


        // Send email FIRST
        await contactTransporter.sendMail(mailOptions);


        // Only mark replied if email was successfully sent
        contact.adminReply = adminReply.trim();
        contact.status = "replied";
        contact.repliedAt = new Date();

        await contact.save();


        res.json({
            message: "Reply sent successfully",
            contact: contact
        });


    } catch (error) {

        console.error("Contact reply error:", error);

        res.status(500).json({
            message: "Failed to send reply"
        });
    }
}