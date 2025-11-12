import prisma from "../utils/prismaClient.js"; // adjust import

export const getAllUsers = async (req, res) => {
    try {
        const perPage = parseInt(req.query.perPage) || 3;
        const currentPage = parseInt(req.query.page) || 1;
        const sorting = parseInt(req.query.sort) || "asc";

        const userCount = await prisma.user.count();
        const totalPages = Math.ceil(userCount / perPage);

        const usersList = await prisma.user.findMany({
            skip: (currentPage - 1) * perPage,
            take: perPage,
            orderBy: { id: sorting },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        res.status(200).json({
            message: "✅ Users fetched successfully",
            pagination: {
                totalUsers: userCount,
                totalPages,
                currentPage,
                perPage,
            },
            data: usersList,
        });
    } catch (err) {
        console.error("❌ Error in getAllUsers:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const createUser = async (req, res) => {
    try {
        const { name, email, role, contact } = req.body;

        // Validate input
        if (!name || !email || !contact) {
            return res.status(400).json({ message: "Name, email, and contact are required" });
        }

        // Check if user already exists with same email OR contact
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { contacts: { some: { value: contact } } }
                ]
            },
            include: { contacts: true } // optional, for debugging
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role,
                contacts: {
                    create: { type: "phone", value: contact } // create contact entry
                }
            },
            include: { contacts: true } // return contacts in response
        });

        res.status(201).json({
            message: "✅ User created successfully",
            data: newUser
        });

    } catch (err) {
        console.error("Error creating user:", err);

        // Handle Prisma unique constraint error
        if (err.code === "P2002") {
            return res.status(400).json({ message: "Email already in use" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id); // convert string to integer
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const getUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        if (!getUser) {
            return res.status(404).json({ message: `User with id ${id} not found` });
        }

        res.status(200).json({ message: "User fetched successfully", data: getUser });
    } catch (err) {
        console.error("Error fetching user by id:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const { name, email, contact, role } = req.body;

        // Validate input
        if (!name && !email && !contact && !role) {
            return res.status(400).json({ message: "At least one field (name, email, role) is required" });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(contact && { contact })
            },
            select: { id: true, name: true, email: true, role: true, updatedAt: true }
        });

        res.status(200).json({
            message: `✅ User with ID ${id} updated successfully`,
            data: updatedUser
        });
    } catch (err) {
        console.error("Error updating user:", err);

        // Handle not found error
        if (err.code === "P2025") { // Prisma specific: record not found
            return res.status(404).json({ message: `User with ID ${req.params.id} not found` });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const deletedUser = await prisma.user.delete({
            where: { id },
            select: { id: true, name: true, email: true }
        });

        res.status(200).json({
            message: `✅ User with ID ${id} deleted successfully`,
            data: deletedUser
        });
    } catch (err) {
        console.error("Error deleting user:", err);

        // Handle not found error
        if (err.code === "P2025") {
            return res.status(404).json({ message: `User with ID ${req.params.id} not found` });
        }

        res.status(500).json({ message: "Internal server error", error: err });
    }
};