const { Telegraf } = require("telegraf");
const youtubedl = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);

if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.length > 5) {
    console.log(`Token uğurla oxundu. Uzunluq: ${process.env.BOT_TOKEN.length}`);
} else {
    console.error("KRİTİK XƏTA: BOT_TOKEN ətraf dəyişəni tapılmadı və ya boşdur!");
}

// --- YTDLP Cookie Düzəlişi üçün Başlanğıc Tənzimləmələr ---
const cookieContent = process.env.YTDLP_COOKIES;
const cookieFilePath = path.join('/tmp', 'youtube_cookies.txt');
const ytdlpCookieOption = {};

if (cookieContent && cookieContent.length > 0) {
    try {
        // YTDLP-nin istifadə edə bilməsi üçün cookie faylını /tmp-də yaradırıq.
        // Bu fayl bot işə düşdüyü zaman bir dəfə yazılır.
        fs.writeFileSync(cookieFilePath, cookieContent.trim());
        
        // youtubedl-exec kitabxanasının options obyektinə cookies yolunu əlavə edirik.
        ytdlpCookieOption.cookies = cookieFilePath; 
        
        console.log('✅ YTDLP Cookie faylı uğurla yazıldı və istifadəyə hazırlandı. Bot indi yaş məhdudiyyətli videoları endirə bilər.');
    } catch (e) {
        console.error('❌ KRİTİK XƏTA: Temporary cookie faylını yazmaq mümkün olmadı:', e.message);
    }
} else {
    console.log('ℹ️ YTDLP_COOKIES ətraf dəyişəni tapılmadı. Bot cookiesiz işləyir və yaş məhdudiyyətli videolar uğursuz ola bilər.');
}
// --- YTDLP Cookie Düzəlişi üçün Başlanğıc Tənzimləmələr Sona Çatdı ---


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

        // youtubedl çağırışına cookie opsiyasını (əgər varsa) əlavə edirik
        const output = await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0, 
            output: '/tmp/%(title)s.%(ext)s', 
            ...ytdlpCookieOption, // Cookie faylının yolunu əlavə edir
        });

 
        const filePath = output.filepath;


        await ctx.replyWithAudio({ source: filePath }, {
            caption: `Uğurla endirildi: ${output.title}`
        });


        // Faylı serverdən silmək
        if (filePath && fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }

    } catch (error) {
        console.error("XƏTA BAŞ VERDİ:", error.message); // Daha oxunaqlı olması üçün yalnız message çap edirik
        
        let errorMessage = 'Bağışlayın, endirmə zamanı bir xəta baş verdi. Zəhmət olmasa, başqa bir linklə cəhd edin.';
        
        // YouTube giriş xətasını tuturuq
        if (error.stderr && error.stderr.includes('Sign in to confirm you’re not a bot')) {
             errorMessage = 'XƏBƏRDARLIQ: YouTube bu videonu yükləmək üçün giriş (login) tələb edir (Məsələn, yaş məhdudiyyəti səbəbiylə). Bu problemin həlli üçün `YTDLP_COOKIES` secret dəyişəni tənzimlənməlidir.';
        }

        ctx.reply(errorMessage);
    }
});

bot.launch().then(() => {
    console.log('Bot işə salındı.');
});


process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));