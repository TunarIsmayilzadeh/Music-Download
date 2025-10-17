const { Telegraf } = require("telegraf");
const youtubedl = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");

// const bot = new Telegraf("8353240854:AAGrhzzxJEO8lfebDETqEszz-O5ysC3C0k0");
const bot = new Telegraf(process.env.BOT_TOKEN);

if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.length > 5) {

    console.log(`Token uğurla oxundu. Uzunluq: ${process.env.BOT_TOKEN.length}`);
} else {

    console.error("KRİTİK XƏTA: BOT_TOKEN ətraf dəyişəni tapılmadı və ya boşdur!");
}

// const ffmpegPath = "C:\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe";
//telegram bot 

bot.command('start', (ctx) => {
    ctx.reply('Salam! Zəhmət olmasa, endirmək istədiyiniz YouTube video linkini göndərin:');
});


bot.on('text', async (ctx) => {
    const url = ctx.message.text.trim();


    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return ctx.reply('Zəhmət olmasa, yalnız etibarlı bir YouTube linki göndərin.');
    }

    try {
        await ctx.reply('Yüklənir və MP3-ə çevrilir... Bu, bir az vaxt ala bilər.');

        const output = await youtubeDl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0, 
            output: '/tmp/%(title)s.%(ext)s', 
        });

 
        const filePath = output.filepath;


        await ctx.replyWithAudio({ source: filePath }, {
            caption: `Uğurla endirildi: ${output.title}`
        });


        if (filePath) {
            await fs.promises.unlink(filePath);
        }

    } catch (error) {
        console.error("XƏTA BAŞ VERDİ:", error);
        
        let errorMessage = 'Bağışlayın, endirmə zamanı bir xəta baş verdi. Zəhmət olmasa, başqa bir linklə cəhd edin.';
        

        if (error.stderr && error.stderr.includes('Sign in to confirm you’re not a bot')) {
             errorMessage = 'XƏBƏRDARLIQ: YouTube bu videonu yükləmək üçün giriş (login) tələb edir (Məsələn, yaş məhdudiyyəti səbəbiylə). Zəhmət olmasa, başqa bir video ilə cəhd edin.';
        }

        ctx.reply(errorMessage);
    }
});


process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

