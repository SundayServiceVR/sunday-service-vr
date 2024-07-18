// AUTHENTICATION ROUTES USING PASSPORT TO HANDLE THE OAUTH2 DANCE
import { Router } from "express";
import passport from "passport";
import { getAuth, signInWithCustomToken } from "firebase/auth";

// eslint-disable-next-line new-cap
const authRouter = Router();

const auth = getAuth();

authRouter.get("/logout", async (req, res, next) => {
    await auth.signOut();
    req.logout((error) => {
        if (error) {
            return next(error);
        }
        res.redirect("/api/user");
    });
});

// THIS IS THE OAUTH2 CALLBACK ROUTE
authRouter.get(
    "/auth",
    passport.authenticate("discord", { failureRedirect: "/error" }),
    (req, res) => {
        // IF ALL WENT WELL, SEND THEM TO THE DASHBOARD.
        // DASHBOARD PAGE CHECKS IF USERS ARE MEMBERS.
        // IF THEY AREN'T, /DASHBOARD SENDS THEM TO THE ROOT (/)
        res.redirect("/api/user");
    }
);

authRouter.get(
    "/login",
    passport.authenticate("discord", {
        scope: process.env.DISCORD_OAUTH_SCOPES?.split(","),
        failureRedirect: "/error",
    },
    async function(req: { user: { token: string; }; }) {
        await signInWithCustomToken(auth, req.user.token);
    })
);

export default authRouter;
