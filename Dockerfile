# 🔹 1. Daha yeni Node versiyası ilə başla (20.x)
FROM node:20-bullseye

# 🔹 2. Lazımi sistem asılılıqları (ffmpeg, python, wget)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 🔹 3. yt-dlp faylını əllə yüklə (postinstall.js əvəzinə)
RUN mkdir -p /usr/local/bin && \
    wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# 🔹 4. İş qovluğu
WORKDIR /app

# 🔹 5. Layihə fayllarını əlavə et
COPY package*.json ./

# 🔹 6. youtube-dl-exec-in postinstall skriptini atla
RUN npm config set ignore-scripts true
RUN npm install --force

# 🔹 7. Qalan faylları əlavə et
COPY . .

# 🔹 8. Default start komandası
CMD ["node", "index.js"]
