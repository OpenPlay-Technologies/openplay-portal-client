const ENV = (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "devnet" | "testnet" | "localnet" | undefined);

const gameConfigs = {
    localnet: {
        id: "0x45ccb0c52ec3fd8f21a917504f8fb880b05b15b48f5f54c33aa3b8f5b8a9db54",
        house_id: "0x65cb09885d1b0da9c6d26ceba1fc1614ca8e7d972137d518ac6ce39fd0da53c3",
        title: "Local Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
        stakes: [1e9, 2e9, 5e9, 10e9],
    },
    testnet: {
        id: "0x9a7acae281727539866c345aa576ec702cace8bcf541f4221785780a15bd66a5",
        house_id: "0x841cdc09b4ac2b6c991e053f21b2e1a3cb7623ea07b23ccf621b04984b3852d3",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
        stakes: [1e7, 2e7, 5e7, 10e7, 20e7, 50e7, 100e7],
    },
    devnet: {
        id: "",
        house_id: "",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
        stakes: [1e7, 2e7, 5e7, 10e7, 20e7, 50e7, 100e7],
    },
    mainnet: {
        id: "",
        house_id: "",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
        stakes: [1e7, 2e7, 5e7, 10e7, 20e7, 50e7, 100e7],
    },
};

export const gameMetaData = gameConfigs[ENV ?? "localnet"];
