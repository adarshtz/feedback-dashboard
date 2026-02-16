# University Feedback Dashboard

A comprehensive Next.js application for analyzing teacher feedback data with JWT authentication, Excel upload, and interactive data visualization.

## Features

- 🔐 **JWT Authentication** - Secure admin-only access
- 📊 **Data Visualization** - Interactive charts and graphs using Recharts
- 📁 **Excel Upload** - Parse and analyze feedback data from Excel files
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚡ **Server Actions** - Fast backend processing with Next.js Server Actions
- 📱 **Responsive Design** - Works seamlessly on all devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:

```bash
cd feedback-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. The `.env.local` file is already created with default values for testing.

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

For testing purposes:
- **Email**: admin@university.edu
- **Password**: admin123

**⚠️ IMPORTANT**: Change these credentials in production!

## Excel File Format

The application expects an Excel file (.xlsx or .xls) with the following columns:

| Column Name | Description | Required |
|------------|-------------|----------|
| Teacher Name | Name of the teacher | Yes |
| Subject | Course or subject name | Yes |
| Department | Academic department | Yes |
| Rating | Numerical rating (e.g., 1-5) | Yes |
| Comments | Student feedback comments | No |
| Semester | Academic semester | No |
| Academic Year | Year of evaluation | No |

### Sample Excel Data

```
Teacher Name | Subject | Department | Rating | Comments
John Doe | Mathematics | Science | 4.5 | Excellent teacher
Jane Smith | Physics | Science | 4.8 | Very engaging lectures
```

## Dashboard Features

### Overview Tab
- Summary statistics (total feedbacks, average rating, teacher count, department count)
- Department performance bar chart
- Feedback distribution pie chart
- Rating distribution area chart
- Top 10 teachers bar chart

### Departments Tab
- Detailed department statistics table
- Average ratings by department
- Feedback counts
- Performance indicators

### Teachers Tab  
- Individual teacher performance metrics
- Department associations
- Subject counts
- Rating comparisons

### All Data Tab
- Complete dataset table
- Color-coded ratings
- Feedback comments

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Authentication**: JWT
- **Excel Parsing**: xlsx

## Building for Production

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
