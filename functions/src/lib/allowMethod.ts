import { Request, Response } from "@google-cloud/functions-framework";

export const allowMethod = (req: Request, res: Response, method: Request["method"]) => {
    if (req.method !== method) {
        res.status(405).send("Method Not Allowed");
        throw new Error("Method Not Allowed: Only ${method} requests are allowed");
    }
};
