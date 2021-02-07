import type { Model } from "sequelize";

export const getAttributes = <A, CA>(instance: Model<A, CA>): A => instance.get({ plain: true });
