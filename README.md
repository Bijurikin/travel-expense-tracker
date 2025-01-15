# Travel Expense Tracker

A modern web application for tracking travel expenses with image receipts, built with Next.js 14.

## Features

- 📸 Upload receipt images with camera or file selection
- 💰 Track expense amounts with categories
- 📝 Add optional descriptions for each expense
- 📊 View and manage expenses in a table format
- ✏️ Edit existing expenses
- 🗑️ Delete unwanted entries

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Animations**: [Framer Motion](https://framer.com/motion)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-expense-tracker.git
cd travel-expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The `.env.local` file is only for local development. For production deployment, configure environment variables through your hosting platform's dashboard (e.g., Vercel, Netlify) to ensure secure handling of sensitive information.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Main application pages and routing
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
