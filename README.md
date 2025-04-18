
# AI Recipe Generator

A web application that generates recipes based on ingredients available in your fridge using AI and connects to Supabase for data storage.

## Features

- **Ingredient-Based Recipe Generation**: Enter ingredients you have on hand and get AI-generated recipes
- **User Authentication**: Create an account to save and manage your favorite recipes
- **Recipe Collection**: Save, view, and delete your generated recipes
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **AI**: OpenAI API for recipe generation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Set up your Supabase project:
   - Create a new Supabase project
   - Run the SQL migrations in the `supabase/migrations` folder
   - Deploy the Edge Functions in the `supabase/functions` folder
   - Set the `OPENAI_API_KEY` in your Supabase project settings

5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Generate Recipes**:
   - Enter ingredients you have available
   - Click "Generate Recipe" to get an AI-generated recipe
   - Save recipes you like to your collection

2. **Manage Your Recipes**:
   - View all your saved recipes
   - Search through your recipe collection
   - Delete recipes you no longer want

## Project Structure

- `/src`: Frontend React application
  - `/components`: UI components
  - `/hooks`: Custom React hooks
  - `/lib`: Utility functions
- `/supabase`: Supabase configuration
  - `/migrations`: SQL migrations for database setup
  - `/functions`: Edge Functions for serverless backend logic

## License

This project is licensed under the MIT License - see the LICENSE file for details.