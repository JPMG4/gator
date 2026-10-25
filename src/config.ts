import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName: string;
};

function getConfigFilePath(): string {
  const configFileName = ".gatorconfig.json";
  const homeDir = os.homedir();
  return path.join(homeDir, configFileName);
}

function writeConfig(config: Config): void {
    const configFilePath = getConfigFilePath();
    const rawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    };
    fs.writeFileSync(configFilePath, JSON.stringify(rawConfig, null, 2), "utf-8");
    }

function validateConfig(rawConfig: any): Config {
    if (!rawConfig.db_url) {
        throw new Error("Missing required field: db_url");
    }
    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name || "",
    };
    return config;
}
export function readConfig(): Config {
  const fullPath = getConfigFilePath();
  const data = fs.readFileSync(fullPath, "utf-8");
  const rawConfig = JSON.parse(data);
  return validateConfig(rawConfig);
}

export function setUser(userName: string): void {
    const config = readConfig();
    config.currentUserName = userName;
    writeConfig(config);
}


