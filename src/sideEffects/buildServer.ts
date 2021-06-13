/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as restify from "restify";
import type { ControllerInput, Controller } from "./buildController";
import type { DataAccessLayer } from "./sequelize";
import type { Loggers } from "./buildLoggers";

const buildRequestHandler = (
    dataAccessLayer: DataAccessLayer,
    controller: Controller,
    loggers: Loggers,
): restify.RequestHandler => async (req, res) => {
    const input: ControllerInput = {
        inputs: {
            params: req.params,
            query: req.query,
            body: req.body,
        },
        dataAccessLayer,
        getTime: () => Date.now(),
        loggers,
    };

    const [ code, data ] = await controller(input)();

    res.send(code, data);
    res.end();
};

type ServerRecipe = Readonly<{
    name: string,
    dataAccessLayer: DataAccessLayer,
    healthCheckController: Controller,
    createUserController: Controller,
    updateUserController: Controller,
    deleteUserController: Controller,
    findAllUsersController: Controller,
    loggers: Loggers,
}>;

export const buildServer = ({
    name,
    dataAccessLayer,
    healthCheckController,
    createUserController,
    updateUserController,
    deleteUserController,
    findAllUsersController,
    loggers,
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

    server.get("/", buildRequestHandler(dataAccessLayer, healthCheckController, loggers));
    server.post("/users", buildRequestHandler(dataAccessLayer, createUserController, loggers));
    server.put("/users/{id}", buildRequestHandler(dataAccessLayer, updateUserController, loggers));
    server.get("/users", buildRequestHandler(dataAccessLayer, findAllUsersController, loggers));
    server.del("/users/{id}", buildRequestHandler(dataAccessLayer, deleteUserController, loggers));

    return server;
};
