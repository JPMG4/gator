import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";
import { CommandHandler } from "./commands/commands";
import { User } from "./lib/db/schema";

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn: middlewareLoggedIn = (handler) => {
  return async (cmdName, ...args) => {
    const config = readConfig();
    const user = await getUserByName(config.currentUserName);
    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }
    await handler(cmdName, user, ...args);
  };
};
