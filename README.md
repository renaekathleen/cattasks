# Cat Tasks

A little cute to-do list app where each task has a cat checkbox. Click the cat to complete a task and it purrs.

I made this because I had a dream about it. In reality, my girlfriend's cat was purring next to my head while I slept and it made its way into my dream.

Tasks are saved to localStorage by default. Sign in with Google to sync with Google Tasks.

## Running it

```
npm install
npm run dev
```

## Google Tasks integration (optional)

To enable Google SSO and Google Tasks sync:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Tasks API**
3. Create OAuth 2.0 credentials (Web application type)
4. Add `http://localhost:5173` as an authorized JavaScript origin
5. Copy `.env.example` to `.env` and paste your client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Without a client ID, the app works fine with localStorage only.
