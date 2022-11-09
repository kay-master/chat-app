import { Express } from "express";

import pingRoute from "./ping.route";

const routes = (app: Express) => {
	app.use("/ping", pingRoute);

	return app;
};

export default routes;
