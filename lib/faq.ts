export const faqSections = [
    {
        title: "Getting Started & Wallet",
        items: [
            {
                question: "How do I start playing?",
                answer:
                    "Simply connect your wallet—no sign-up or personal info required. Then, deposit funds into your balance manager to begin playing.",
            },
            {
                question: "What if I don’t have a wallet?",
                answer:
                    "Check out this guide on setting up a Sui-compatible wallet: https://blog.sui.io/sui-wallets/.",
            },
        ],
    },
    {
        title: "Using the Balance Manager",
        items: [
            {
                question: "Why do I need a balance manager?",
                answer:
                    "It lets you play seamlessly without having to sign every individual transaction.",
            },
            {
                question: "Who can access the balance manager?",
                answer:
                    "A special token is sent to your wallet—only you can deposit or withdraw. A separate browser token lets you play without extra signing.",
            },
            {
                question: "How do I withdraw funds from the balance manager?",
                answer:
                    "Withdrawals require the special wallet token, ensuring that only you can access and manage your funds.",
            },
            {
                question: "Are withdrawals instant?",
                answer:
                    "Yes, you can deposit and withdraw at any time from the balance manager without any additional constraints",
            },
        ],
    },
    {
        title: "Fairness & Game Mechanics",
        items: [
            {
                question: "How are game outcomes determined?",
                answer:
                    "Outcomes are generated using Sui’s native randomness module for secure, unpredictable results.",
            },
            {
                question: "What does “provably fair” mean?",
                answer:
                    "Every result is recorded on-chain, allowing anyone to verify the fairness of the game.",
            },
            {
                question: "Can I check the fairness of each game?",
                answer:
                    "Yes—game logic and transactions are transparent and publicly verifiable on the blockchain.",
            },
        ],
    },
    {
        title: "Transactions, Payouts & Support",
        items: [
            {
                question: "Are there any fees?",
                answer:
                    "Gameplay fees are sponsored by the house; you only pay Sui transaction fees for deposits and withdrawals.",
            },
            {
                question: "How fast are transactions?",
                answer:
                    "Transactions typically complete within 1–2 seconds, depending on your location.",
            },
            {
                question: "How can I be sure I’ll be paid out if I win?",
                answer:
                    "The smart contract only accepts bets when the house has sufficient funds to cover potential winnings. Winnings are immediately added to your balance manager.",
            },
            {
                question: "Where can I get support or learn more?",
                answer:
                    "For technical issues, contact us on Telegram: https://t.me/dev_0x0687. You can also explore our docs for additional details: https://openplay.gitbook.io/openplay-docs.",
            },
        ],
    },
];
