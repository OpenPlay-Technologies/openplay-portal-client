import type {Config} from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                'xs': '480px',
            },
            boxShadow: {
                glow: '0 0 10px 5px rgba(255, 255, 255, 0.3)',
            },
            keyframes: {
                slideDown: {
                    "0%": {
                        transform: 'translateY(-20px)',
                        opacity: '0'
                    },
                    "100%": {
                        transform: 'translateY(0)',
                        opacity: '1'
                    },
                },
                progress: {
                    "0%": {
                        transform: "translateX(0) scaleX(0)",
                        easing: "cubic-bezier(0.87, 0, 0.13, 1)"
                    },
                    "40%": {
                        transform: "translateX(30%) scaleX(0.4)"
                    },
                    "70%": {
                        transform: "translateX(85%) scaleX(1.2)"
                    },
                    "85%": {
                        transform: "translateX(95%) scaleX(0.9)"
                    },
                    "100%": {
                        transform: "translateX(100%) scaleX(1)"
                    }
                },
                'slide-from-top': {
                    '0%': {
                        transform: 'translateY(-100%)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1'
                    },
                },
                'shift-down': {
                    '0%': {
                        transform: 'translateY(0)'
                    },
                    '50%': {
                        transform: 'translateY(var(--item-height, 20px))'
                    },
                    '100%': {
                        transform: 'translateY(0)'
                    }
                },
                highlight: {
                    "0%": {
                        opacity: '0'
                    },
                    "100%": {
                        opacity: '1'
                    },
                }
            },
            animation: {
                progress: "progress 1s infinite linear",
                slideDown: "slideDown 0.3s ease-out forwards",
                'slide-from-top': 'slide-from-top 0.3s ease-out forwards',
                'shift-down': 'shift-down 0.3s ease-out forwards',
                highlight: 'highlight 2s ease-in-out',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                openplay1: '#fd9248',
                openplay2: '#fa1768',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
