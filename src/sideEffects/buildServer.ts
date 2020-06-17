/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as restify from "restify";
import { Task } from "fp-ts/lib/Task";

export const buildServer = (name: string) => (
    healthCheckController: Task<number>,
) : restify.Server => {
    const server = restify.createServer({ name });

    server.use(( _, res, next ) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        
        return next();
    });

    server.use(restify.plugins.acceptParser(server.acceptable));
    server.use(restify.plugins.queryParser({ mapParams: true }));
    server.use(restify.plugins.bodyParser());

    server.on("uncaughtException", (_, res) => {
        res.send(500);
    });

    server.get("/", async (req, res) => {
        const status = await healthCheckController();
        
        res.send(status);
    });

    return server;
};
