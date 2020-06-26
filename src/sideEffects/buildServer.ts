/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as restify from "restify";
import { Task } from "fp-ts/lib/Task";
import { ControlerInput } from "./buildController";
import { DataAccessLayer } from "./sequelize";

export const buildServer = (
    name: string,
    dataAccessLayer: DataAccessLayer,
    healthCheckController: Task<number>,
    createUserControler: (controlerInput: ControlerInput) => Task<[number, unknown]>,
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

    server.post("/users", async (req, res) => {
        const controlerInput: ControlerInput = {
            inputs: {
                params: req.params,
                query: req.query,
                body: req.body,
            },
            dataAccessLayer,
            getTime: () => Date.now(),
        };

        const [ code, data ] = await createUserControler(controlerInput)();

        res.send(code, data);
    });

    return server;
};
