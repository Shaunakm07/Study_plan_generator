# Study Plan Generator

A Next.js application for generating study plans. Built with TypeScript, Tailwind CSS, and the Next.js App Router.

## Prerequisites

Before running this application, make sure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **npm** (version 9.0 or higher) - comes bundled with Node.js

You can check your versions by running:
```bash
node --version
npm --version
```

## Installation

1. Clone or navigate to the project directory:
```bash
cd Study_plan_generator
```

2. Install the dependencies:
```bash
npm install
```

This will install all required packages listed in `package.json`.

## Running the Application

### Development Mode

To start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

- The page will automatically reload when you make changes to the code
- You can start editing the page by modifying `app/page.tsx`
- View API routes and other features through the Next.js development interface

### Production Build

To create an optimized production build:

```bash
npm run build
```

This command:
- Compiles TypeScript code
- Optimizes images and assets
- Generates static pages where possible
- Creates an optimized production bundle

### Production Server

After building, you can start the production server:

```bash
npm start
```

This starts the Next.js production server using the optimized build created by `npm run build`.

### Linting

To check your code for linting errors:

```bash
npm run lint
```

This will run ESLint and report any code quality issues or potential errors.

## Available Scripts

- `npm run dev` - Start the development server (default port: 3000)
- `npm run build` - Create an optimized production build
- `npm start` - Start the production server (requires `npm run build` first)
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
Study_plan_generator/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── favicon.ico        # Site favicon
├── public/                # Static assets
├── node_modules/          # Dependencies (generated)
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
└── package.json           # Project dependencies and scripts
```

## Technologies Used

- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **ESLint** - Code linting and quality checks

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -p 3001
```

### Module Not Found Errors

If you encounter module not found errors, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

If you encounter build errors:

1. Make sure all dependencies are installed: `npm install`
2. Check TypeScript errors: The build process will show any TypeScript errors
3. Run the linter: `npm run lint` to identify code issues

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [React Documentation](https://react.dev) - Learn about React
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - Learn about TypeScript
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build settings

For more deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

Made with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
