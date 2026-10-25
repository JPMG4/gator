import { setUser, readConfig } from "../config";
import { createUser, getUserByName, getUsers } from "../lib/db/queries/users";

export async function handlerLogin(_cmdName: string, ...args: string[]) {
    const username = args[0];
    if (!username) {
    throw new Error("usage: login <username>");
    }
    const user = await getUserByName(username);
    if (!user) {
    throw new Error(`User ${username} not found.`);
    }
    setUser(username);
    console.log(`Logged in as ${username}.`);
}

export async function handlerRegister(_cmdName: string, ...args: string[]) {
    const username = args[0];
    if (!username) {
        throw new Error("usage: register <username>");
    }
    const user = await createUser(username);
    setUser(username);
    console.log(`User created: ${username}`);
    console.log(user);
}

export async function handlerListUsers() {
    const users = await getUsers();
    const config = readConfig();
    for (const user of users) {
        if (user.name === config.currentUserName) {
        console.log(`* ${user.name} (current)`);
        } else {
        console.log(`* ${user.name}`);
        }
}
}
