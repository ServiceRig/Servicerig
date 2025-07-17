# **App Name**: ServiceRig 2.0

## Core Features:

- Role-Based Authentication: Role-based authentication using Firebase Auth, supporting Admin, Dispatcher, and Technician roles with appropriate routing and layout adaptations.
- Interactive Scheduling: Interactive scheduling views (Daily, Weekly, Technician) with drag-and-drop, resize, and snap-to-edge functionality for efficient job management.
- Customer Management: Comprehensive CRM module for managing customer contacts, equipment, and service history timeline, including jobs, purchase orders, estimates, and invoices.
- Timeclock: Real-time timeclock feature with clock-in/out functionality, displaying gross and estimated net pay calculations for technicians.
- Service Agreements: Service agreement management including recurring billing and automated job creation with customizable billing frequencies.
- AI-Powered Estimates: AI-powered tiered estimate generation (Good/Better/Best) for creating tailored proposals using a tool to consider job details and customer history to suggest optimal service tiers.
- Invoicing with Stripe: Invoice generation directly from estimates or change orders, with integrated Stripe payment processing and tracking of paid/overdue status.

## Style Guidelines:

- Primary color: A strong blue (#3498DB) evoking reliability and professionalism, fitting for a service-oriented platform.
- Background color: A very light blue (#F0F8FF), providing a clean, unobtrusive backdrop that enhances readability.
- Accent color: A vibrant orange (#FF851B), used strategically for key interactive elements and calls to action to draw the user's eye.
- Body text font: 'PT Sans', a clean and modern sans-serif font, which is appropriate for both headings and body copy in this context.
- Code font: 'Source Code Pro' for displaying code snippets.
- Consistent use of flat, minimalist icons from Lucid-react to represent different functions and modules within the application.
- Clean, modular layout using TailwindCSS and ShadCN UI components, optimized for responsiveness and intuitive navigation.