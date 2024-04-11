import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";
config();

const botID = "762235476387299328";
const serverID = "762236643042000906";
const TOKEN = process.env.DISCORD_TOKEN;

const rest = new REST().setToken(TOKEN);

let commands;

await (async () => {
    try {
        commands = await rest.get(
            Routes.applicationGuildCommands(botID, serverID)
        );
        console.log(commands);
    } catch (error) {
        console.error(error);
    }
})();

for (let command of commands) {
    (async () => {
        try {
            await rest.delete(
                Routes.applicationGuildCommand(botID, serverID, command.id)
            );
            console.log('Successfully deleted guild command');
        } catch (error) {
            console.error(error);
        }
    })();
}
const unregisterCommands = async () => {

}