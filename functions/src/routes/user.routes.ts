// USER ROUTES TO HANDLE NEW USERS, FETCHING ALL USERS AND/OR CURRENT USER
import { Router } from "express";
import * as userService from "../services/user.service";

// eslint-disable-next-line new-cap
const userRouter = Router();

userRouter.get("/user", (req, res) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.status(404).json({
            success: false,
            error: "user not found",
        });
    }
});

// GET ALL USERS FROM DATABASE
userRouter.get("/users", async (req, res) => {
    try {
        const users = await userService.getUsers();
        return res.json(users);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error getting users: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        } else {
            console.error(`Error getting users: ${error}`);
            return res.status(500).json({ success: false, error: error });
        }
    }
});

// CREATE NEW USER IN DATABASE
userRouter.post("/users/new", async (req, res) => {
    try {
        const newUser = await userService.newUser(req.body);
        return res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error creating a user: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        } else {
            console.error(`Error creating a user: ${error}`);
            return res.status(500).json({ success: false, error: error });
        }
    }
});

// FIND SPECIFIC USER OR CHECK IF SPECIFIC USER EXISTS
userRouter.post("/users/find", async (req, res) => {
    try {
        const search = await userService.findUser(req.body.id);
        return res.status(200).json(search);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error finding a user: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        } else {
            console.error(`Error finding a user: ${error}`);
            return res.status(500).json({ success: false, error: error });
        }
    }
});

export default userRouter;
