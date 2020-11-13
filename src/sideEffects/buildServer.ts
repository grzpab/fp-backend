/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as restify from "restify";
import { ControllerInput, Controller } from "./buildController";
import { DataAccessLayer } from "./sequelize";

const buildRequestHandler = (
    dataAccessLayer: DataAccessLayer,
    controller: Controller,
): restify.RequestHandler => async (req, res) => {
    const controllerInput: ControllerInput = {
        inputs: {
            params: req.params,
            query: req.query,
            body: req.body,
        },
        dataAccessLayer,
        getTime: () => Date.now(),
    };

    const [ code, data ] = await controller(controllerInput)();

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
}>;

export const buildServer = ({
    name,
    dataAccessLayer,
    healthCheckController,
    createUserController,
    updateUserController,
    deleteUserController,
    findAllUsersController,
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

    server.get("/", buildRequestHandler(dataAccessLayer, healthCheckController));
    server.post("/users", buildRequestHandler(dataAccessLayer, createUserController));
    server.put("/users/{id}", buildRequestHandler(dataAccessLayer, updateUserController));
    server.get("/users", buildRequestHandler(dataAccessLayer, findAllUsersController));
    server.del("/users/{id}", buildRequestHandler(dataAccessLayer, deleteUserController));

    return server;
};
