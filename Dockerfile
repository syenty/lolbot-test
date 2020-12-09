FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN mkdir /usr/share/fonts/nanumfont
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip
RUN unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont

ENV LANG=ko_KR.UTF-8 \ 
    LANGUAGE=ko_KR.UTF-8

RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "lolbot-discord.js"]
