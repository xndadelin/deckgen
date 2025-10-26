<div align="center">
  <a href="https://moonshot.hackclub.com" target="_blank">
    <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/35ad2be8c916670f3e1ac63c1df04d76a4b337d1_moonshot.png" 
         alt="This project is part of Moonshot, a 4-day hackathon in Florida visiting Kennedy Space Center and Universal Studios!" 
         style="width: 100%;">
  </a>
</div>
# deckgen ‼️

deckgen is an open-source web application that leverages AI to help you create effective decks of flashcards for learning

## Some key features
- Generate decks with the DEEPSEEK api
- You can edit afterwards the flascards
- Learn by spaced repetition algoritm

## Requirements to run it on your localhost
- Node.js 20+
- Yarn
- Docker
- Supabase instance

## Local instance
1. Clone the rope
```bash
git clone https://github.com/xndadelin/deckgen.git
cd deckgen
```
2. Copy env file
```bash
cp .env.example .env
```
3. Set env variables in .env
```bash
DEEPSEEK_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Production
```bash
yarn build
yarn start
```

## Docker
```bash
docker build -t deck .
docker run --env-file .env -p 3000:3000 deck
```

## Contributing
Open issues or PRs on Github. Please write clear commite messages.
