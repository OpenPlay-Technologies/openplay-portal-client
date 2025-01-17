export interface RegistryData {
    id: string,
    games: string[]
}

export enum GameType {
    CoinFlip = "CoinFlip"
}

export interface CoinFlipState {
    number_of_house_bias: number;
    number_of_heads: number;
    number_of_tails: number;
    recent_throws: string[];
}

export interface CoinFlipGame {
    max_stake: number;
    contexts: Table;
    house_edge_bps: number;
    payout_factor_bps: number;
    state: CoinFlipState;
}
export interface Balance {
    value: number
}


export interface VaultData {
    epoch: number;
    collected_protocol_fees: Balance
    collected_owner_fees: Balance,
    play_balance: Balance;
    reserve_balance: Balance;
    active: boolean
}

export interface Volumes {
    total_stake_amount: number
}

export interface EndOfDay {
    day_profits: number,
    day_losses: number
}

export interface HistoryData {
    epoch: number,
    pending_stake: number,
    pending_unstake: number,
    current_volumes: Volumes,
    previous_end_of_day: EndOfDay,
    historic_volumes: Table,
    end_of_day_balances: Table,
    all_time_bet_amount: number,
    all_time_win_amount: number,
    all_time_profits: number,
    all_time_losses: number
}

export interface Table {
    id: string,
    size: number
}

export interface State {
    accounts: Table
    history: HistoryData,
}

export interface GameData {
    id: string;
    name: string;
    project_url: string;
    image_url: string;
    game_type: GameType;
    state: State;
    target_balance: number;
    coin_flip: CoinFlipGame;
    vault: VaultData;
    max_stake: string;
}

export interface AccountData {
    lifetime_total_bets: number;
    lifetime_total_wins: number;
    debit_balance: number;
    credit_balance: number;
}

export interface CoinFlipContext {
    stake: number,
    prediction: String,
    result: String,
    status: String,
}

export interface BalanceManagerData {
    id: string,
    balance: {
        value: number
    },
    allow_listed: string[]
}

export interface ParticipationData {
    id: string;
    game_id: string;
    last_updated_epoch: number;
    active_stake: number;
    inactive_stake: number;
    claimable_balance: number;
    unstake_requested: boolean;
}

export interface GameCapData {
    id: string;
    game_id: string;
}