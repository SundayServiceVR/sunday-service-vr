import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import * as userDb from "../services/user.service";
import { DJ, NewDJ } from "../interfaces/dj.interface";

passport.serializeUser((user, done) => {
    done(null, (user as DJ).id);
});

// CHECKS IF A USER ALREADY EXISTS
// IF HE EXISTS, UPDATE THEM, OTHERWISE, CREATE THEM
// FOR MORE INFORMATION ON HOW PASSPORT-JS WORKS, HEAD TO THEIR WEBSITE
passport.deserializeUser(async (uid: string, done) => {
    try {
        const user = await userDb.findUser(uid);
        if (user) {
            done(null, user);
        } else {
            done(null);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error deserializing user: ${error.message}`);
        }
        done(error);
    }
    userDb
        .findUser(uid)
        .then((user) => {
            done(null, user);
        })
        .catch((error) => {
            console.log(`Error deserializing user: ${error.message}`);
        });
});

// DEFINES THE DISCORD OAUTH2 STRATEGY
passport.use(
    new DiscordStrategy(
        {
            // clientID cannot be empty in order to deploy
            clientID: process.env.DISCORD_CLIENT_ID ?? "0",
            clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
            callbackURL: "/api/auth",
            scope: process.env.DISCORD_OAUTH_SCOPES?.split(","),
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const uid = profile.id;
                const searchUser = await userDb.findUserByDiscordId(uid);
                console.log(`SEARCH USER RESULT: ${searchUser}`);
                if (searchUser) {
                    // user exists
                    // update user information
                    console.log("EXISTING USER");
                    done(null, searchUser);
                    return searchUser;
                } else {
                    // create a new user
                    const newUser: NewDJ = {
                        discordId: profile.id,
                        discordUsername: profile.username,
                        djName: profile.displayName,
                        token: accessToken,
                        refreshToken: refreshToken,
                    };
                    await userDb.newUser(newUser);
                    done(null, newUser);
                }
            } catch (error) {
                return console.error(`Error in discord oauth: ${error}`);
            }
        }
    )
);
