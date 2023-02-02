export const getEnv = (name: string) => {
    const env = process.env[name];

    if (env === undefined || env === null) throw Error(`Missing environment variable: ${name}`);

    return env;
};

export const tryParseJSON = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON: ', error);
        return {};
    }
};
