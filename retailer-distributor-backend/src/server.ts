import createApp from "./app";

const startServer = async (): Promise<void> => {
  try {
    const server = await createApp();

    await server.start();

    console.log(`Server running at: ${server.info.uri}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
