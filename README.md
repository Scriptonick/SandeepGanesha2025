# Ganpati Festival Collection Game - Mobile App

A React-based mobile application for collecting Ashtavinayak avatars through daily scratch cards, powered by Supabase.

## Features

- **User Authentication** - Sign up/Sign in with Supabase Auth
- **Daily Scratch Cards** - Get daily chances to win avatars
- **8 Ashtavinayak Collection** - Collect all sacred Ganpati avatars
- **Leaderboard System** - Compete with other players
- **Admin Panel** - Manage users and inventory
- **Real-time Updates** - Powered by Supabase

## Technology Stack

- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS with Ganpati theme

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL migrations in the Supabase SQL editor:
   - Execute the migration files in `supabase/migrations/` folder

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Install and Run

```bash
cd ganpati-mobile-app
npm install
npm run dev
```

## Database Schema

The app uses the following main tables:
- `users` - User profiles and authentication
- `ganpati_avatars` - The 8 Ashtavinayak avatars
- `user_collections` - User's collected avatars
- `scratch_cards` - Daily scratch card history
- `avatar_inventories` - Admin inventory management

## Default Users

After running migrations, you'll have these test accounts:
- **Admin**: admin@ganpati.com / 123456
- **User 1**: user@test.com / 123456  
- **User 2**: jane@test.com / 123456

## Game Rules

- Users get one scratch card per day (1 minute for testing)
- 70% chance of winning an avatar per scratch
- Goal: Collect all 8 Ashtavinayak avatars
- Leaderboard ranks users by completion percentage

## Ashtavinayak Avatars

1. 🕉️ Mayureshwar (Morgaon)
2. 🐘 Siddhivinayak (Siddhatek)
3. 🙏 Ballaleshwar (Pali)
4. 💎 Varadavinayak (Mahad)
5. 🌟 Chintamani (Theur)
6. 🏔️ Girijatmaj (Lenyadri)
7. ⚡ Vighnahar (Ozar)
8. 👑 Mahaganapati (Ranjangaon)

## Admin Features

- View dashboard with game statistics
- Manage avatar inventory quantities
- Add/edit/remove users
- Assign scratch cards to users
- View completion reports

## Development

The app is built with:
- Mobile-first responsive design
- Festival-themed UI with Ganpati colors
- Smooth animations and transitions
- Real-time data updates via Supabase

## Deployment

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Ensure environment variables are set in production

---

**Powered by Orion Stars**  
*Supported by Sandeep CHSL*