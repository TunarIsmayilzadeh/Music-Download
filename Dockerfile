# Node 18 əsaslı Linux imici
FROM node:18-bullseye

# Lazımi alətləri quraşdıraq: ffmpeg və yt-dlp
RUN apt-get update && \
    apt-get install -y ffmpeg wget && \
    wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Layihə fayllarını konteynerə kopyala
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Ətraf mühit dəyişənlərini təyin et (Render burda öz mühit dəyişənlərini əlavə edəcək)
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV YTDLP_PATH=/usr/local/bin/yt-dlp
ENV NODE_ENV=production

# Botu işə sal
CMD ["node", "index.js"]
