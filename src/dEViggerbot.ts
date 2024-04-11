import {config} from "dotenv";
import {Client, EmbedBuilder} from "discord.js";
import {generateDeviggerUrl, arrayToObjectBuilder} from "./querybuilder.js";
// import { outrightOdds, matchup3ballOdds, allPairings } from "./datagolf.js";
// import { threeball } from "./example3ball.js";
import {findEV} from "./dgfetcher.js";

config();
const client = new Client({
    intents: ["Guilds", "GuildMessages", "GuildMembers", "MessageContent"],
});
const TOKEN = process.env.DISCORD_TOKEN;
client.login(TOKEN).catch((e) => console.error(e));
client.on("ready", () => {
    console.log("The bot is logged in.");
});

//populate win,top5,top10,top20 arrays on startup

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "devig") {
        await interaction.deferReply();
        const market = interaction.options.getString("market");
        const legOdds = interaction.options.getString("legodds");
        const finalOdds = interaction.options.getString("finalodds");
        const devigBook = interaction.options.getString("devigbook");
        let list = ["LegOdds", legOdds, "FinalOdds", finalOdds];
        try {
            const baseUrl =
                "http://api.crazyninjaodds.com/api/devigger/v1/sportsbook_devigger.aspx?api=open&";
            const endUrl = "DevigMethod=4&Args=ev_p,fo_o,kelly,dm";
            let queryString =
                baseUrl + generateDeviggerUrl(arrayToObjectBuilder(...list)) + endUrl;
            await fetch(queryString)
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    let dataLength = Object.keys(data).length;
                    Math.round(data.Final.FairValue_Odds);
                    if (data.Final.FairValue_Odds > 0) {
                        data.Final.FairValue_Odds = "+" + data.Final.FairValue_Odds;
                    }
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle(`${market}` + " " + `${finalOdds}`)
                        .addFields([
                            {
                                name: "\t",
                                value: "\t",
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "EV: " +
                                    (data.Final.EV_Percentage * 100).toFixed(2) +
                                    "%" +
                                    "```",
                                inline: true,
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "FV: " +
                                    Math.round(data.Final.FairValue_Odds) +
                                    "```",
                                inline: true,
                            },
                            {
                                name: "\t",
                                value: "\t",
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "HK: " +
                                    (data.Final.Kelly_Full / 2).toFixed(2) +
                                    "```",
                                inline: true,
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "QK: " +
                                    (data.Final.Kelly_Full / 4).toFixed(2) +
                                    "```",
                                inline: true,
                            },
                            {
                                name: "\t",
                                value: "\t",
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "SK: " +
                                    (data.Final.Kelly_Full / 6).toFixed(2) +
                                    "```",
                                inline: true,
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "EK: " +
                                    (data.Final.Kelly_Full / 8).toFixed(2) +
                                    "```",
                                inline: true,
                            },
                            {
                                name: "\t",
                                value: "\t",
                            },
                            {
                                name: " ",
                                value:
                                    "```" +
                                    "WIN: " +
                                    (data.Final.FairValue * 100).toFixed(2) +
                                    "%" +
                                    "```",
                                inline: true,
                            }
                        ]);
                    if (dataLength > 2) {
                        for (let key in data) {
                            let fairValueOdds: string | number;
                            if (key.startsWith("Leg")) {
                                if (data[key].FairValue > 0.5) {
                                    fairValueOdds =
                                        (-2 + (1 - data[key].FairValue) / data[key].FairValue) *
                                        100;
                                } else {
                                    fairValueOdds =
                                        "+" +
                                        Math.round(
                                            ((1 - data[key].FairValue) / data[key].FairValue) * 100
                                        );
                                }
                                if (data[key].Odds > 100) {
                                    data[key].Odds = "+" + data[key].Odds.trim();
                                }
                                embed.addFields([
                                    {
                                        name: key,
                                        value: " ",
                                        inline: false,
                                    },
                                    {
                                        name: "Odds: " + data[key].Odds,
                                        value: " ",
                                        inline: true,
                                    },
                                    {
                                        name: "Fair Value Odds: " + Math.round(fairValueOdds as number),
                                        value: " ",
                                        inline: true,
                                    }
                                ]);
                                console.log("added field");
                            }
                        }
                    }
                    embed.addFields([{
                        name: "Devig book: " + `${devigBook}`,
                        value: " ",
                        inline: false,
                    }]);
                    interaction.editReply({embeds: [embed]});
                });
        } catch (error) {
            console.log(error);
            await interaction.editReply("An error occurred");
        }
    }

});

//populate win/top5/top10/top20 array with slash command
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    if (interaction.commandName === "golflist") {
        // TODO: Not using this array at the moment
        // let markets = ["win", "top5", "top10", "top20", "mc", "make_cut", "frl"];
        let result = await interaction.reply({embeds: [{"title": "ok"}]});
        if (result) {
            return;
        }
        await interaction.deferReply();
        const tour = interaction.options.getString("tour");
        const market = interaction.options.getString("market");
        let embed = new EmbedBuilder().setColor(0x0099ff).setTitle(" ");
        let EVArray = await findEV(tour, market);
        if (!Array.isArray(EVArray)) {
            embed.setTitle("Didn't work");
            interaction.editReply({embeds: [embed]});
            return;
        }
        for (let i = 0; i < EVArray.length; i++) {
            embed.addFields(
                [{
                    name: EVArray[i].event_name,
                    value:
                        EVArray[i].player_name +
                        " " +
                        EVArray[i].market +
                        " " +
                        EVArray[i].fanduel,
                },
                    {
                        name:
                            "```" +
                            "EV: " +
                            EVArray[i].devig.Final.EV_Percentage.toFixed(2) * 100 +
                            "%" +
                            "```",
                        value: " ",
                        inline: true,
                    },
                    {
                        name:
                            "```" + "FV: " + EVArray[i].devig.Final.FairValue_Odds + "```",
                        value: " ",
                        inline: true,
                    },
                    {
                        name: "\t",
                        value: "\t",
                    },
                    {
                        name:
                            "```" +
                            "HK : " +
                            (EVArray[i].devig.Final.Kelly_Full / 2).toFixed(2) +
                            "```",
                        value: " ",
                        inline: true,
                    },
                    {
                        name:
                            "```" +
                            "QK : " +
                            (EVArray[i].devig.Final.Kelly_Full / 4).toFixed(2) +
                            "```",
                        value: " ",
                        inline: true,
                    },
                    {
                        name: "\t",
                        value: "\t",
                    },
                    {
                        name:
                            "```" +
                            "SK : " +
                            (EVArray[i].devig.Final.Kelly_Full / 6).toFixed(2) +
                            "```",
                        value: " ",
                        inline: true,
                    },
                    {
                        name:
                            "```" +
                            "EK : " +
                            (EVArray[i].devig.Final.Kelly_Full / 8).toFixed(2) +
                            "```",
                        value: " ",
                        inline: true,
                    },
                    {
                        name: "\t",
                        value: "\t",
                    },
                    {
                        name:
                            "```" +
                            "WIN: " +
                            (EVArray[i].devig.Final.FairValue * 100).toFixed(2) +
                            "%" +
                            "```",
                        value: " ",
                        inline: true,
                    }
                ]);
        }
        await interaction.editReply({embeds: [embed]});
    }

});
