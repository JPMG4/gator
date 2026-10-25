import { CommandsRegistry, registerCommand, runCommand} from "./commands/commands";
import { handlerLogin, handlerRegister, handlerListUsers } from "./commands/users";
import { handlerReset } from "./commands/reset";
import { handlerAgg } from "./commands/aggregate";
import { handlerAddFeed, handlerListFeeds } from "./commands/feeds";
import { handlerBrowse } from "./commands/browse";
import { middlewareLoggedIn } from "./middleware";
import { handlerFollow, handlerListFeedFollows, handlerUnfollow } from "./commands/feed-follows";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  const commandsRegistry: CommandsRegistry = {};

  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegister);
  registerCommand(commandsRegistry, "users", handlerListUsers);
  registerCommand(commandsRegistry, "reset", handlerReset);
  registerCommand(commandsRegistry, "agg", handlerAgg);
  registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(commandsRegistry, "feeds", handlerListFeeds);
  registerCommand(commandsRegistry, "listfeeds", handlerListFeeds);
  registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerListFeedFollows));
  registerCommand(commandsRegistry, "browse", middlewareLoggedIn(handlerBrowse));
  registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow));

    try {
      await runCommand(commandsRegistry, cmdName, ...cmdArgs);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error(err);        }
        process.exit(1);
    }
    process.exit(0);
}

main();