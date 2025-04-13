# Melodify - README Summary  

**Melodify** is a **music and podcast streaming platform** inspired by Spotify, offering features like user accounts, content management, playback controls, offline mode, and user reviews.  

## 📌 Key Features  
- **User Accounts:** Sign up, log in, and manage profiles.  
- **Content Streaming:** Music, audiobooks, and podcasts.  
- **Playback Controls:** Adjust speed, bookmarks, and resume.  
- **Offline Mode:** Download and listen without internet.  
- **Admin Tools:** Add, edit, and manage content.  

## 🛠 Tech Stack  
- **Backend:** Hono (Cloudflare Workers), Supabase (PostgreSQL & Auth), Drizzle ORM.  
- **Frontend:** React/Next.js.  

## 🚀 Setup  
1. Clone the repo 
2. Install dependencies (`bun install` or `npm install`)  
3. Set up **Supabase** and environment variables 
```bash
npm install @supabase/supabase-js
``` 
4. Run the backend:
```bash
cd melodify/project
bun run dev
```
5. run the frontend:
```bash
cd melodify/client
npm start
```

