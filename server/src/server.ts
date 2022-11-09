import app from "./app";

const { PORT, NODE_ENV } = process.env;

const server = app.listen(PORT || 3001, () => {
	console.log(
		"App is running at http://localhost:%d in %s mode",
		PORT,
		NODE_ENV
	);
	console.log("Press CTRL-C to stop\n");
});

export default server;
