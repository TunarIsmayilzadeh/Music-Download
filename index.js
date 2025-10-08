const { Telegraf } = require("telegraf");
const youtubedl = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");


const bot = new Telegraf(process.env.BOT_TOKEN);

const ffmpegPath = "/usr/bin/ffmpeg"; 

bot.start((ctx) =>
  ctx.reply("Salam! 🎶 Mənə YouTube link göndər, sənin üçün mahnını mp3 şəklində yükləyim.")
);

bot.on("text", async (ctx) => {
  try {
    const url = ctx.message.text.trim();

    if (!url.startsWith("http")) {
      return ctx.reply("❌ Zəhmət olmasa keçərli YouTube link göndər.");
    }

    await ctx.reply("🎧 Mahnı yüklənir, bir az gözlə...");


    const outputTemplate = path.resolve(__dirname, "%(title)s.%(ext)s");


    await youtubedl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: outputTemplate,
      ffmpegLocation: ffmpegPath,
    });


    const info = await youtubedl(url, { dumpSingleJson: true });
    const title = info.title.replace(/[\\/:*?"<>|]/g, "");
    const filePath = path.resolve(__dirname, `${title}.mp3`);


    await ctx.replyWithAudio({ source: filePath });


    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Xəta:", error);
    ctx.reply("❌ Xəta baş verdi, bir az sonra yenidən cəhd et.");
  }
});

bot.launch();
console.log("✅ Bot işə düşdü!");
