/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as restify from "restify";
import { ControlerInput, Controler } from "./buildController";
import { DataAccessLayer } from "./sequelize";

const buildRequestHandler = (
    dataAccessLayer: DataAccessLayer,
    controler: Controler,
): restify.RequestHandler => async (req, res) => {
    const controlerInput: ControlerInput = {
        inputs: {
            params: req.params,
            query: req.query,
            body: req.body,
        },
        dataAccessLayer,
        getTime: () => Date.now(),
    };

    const [ code, data ] = await controler(controlerInput)();

    res.send(code, data);
    res.end();
};

type ServerRecipe = Readonly<{
    name: string,
    dataAccessLayer: DataAccessLayer,
    healthCheckControler?: Controler,
    createUserControler?: Controler,
}>;

export const buildServer = ({
    name,
    dataAccessLayer,
    healthCheckControler,
    createUserControler,
}: ServerRecipe) : restify.Server => {
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

    if (healthCheckControler !== undefined) {
        server.get("/", buildRequestHandler(dataAccessLayer, healthCheckControler));
    }

    if (createUserControler !== undefined) {
        server.post("/users", buildRequestHandler(dataAccessLayer, createUserControler));
    }

    return server;
};
