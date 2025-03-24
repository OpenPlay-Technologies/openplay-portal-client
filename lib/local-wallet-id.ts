import crypto from 'crypto';

export const storeWalletId = (secret: string) => {
    // Store in localStorage as JSON
    localStorage.setItem('wallet-id', secret);
};

export const getStoredWalletId = (): string | null => {
    const item = localStorage.getItem('wallet-id');
    if (!item) return null;

    try {
        return item;
    } catch (err) {
        console.error('Failed to parse stored Sui keypair:', err);
        return null;
    }
};

export const getOrCreateWalletId = (): string => {
    let secret = getStoredWalletId();
    if (!secret) {
        secret = generateWalletId();
        storeWalletId(secret);
    }
    return secret;
};


function generateWalletId() {
    return crypto.randomBytes(32).toString('hex');
  }