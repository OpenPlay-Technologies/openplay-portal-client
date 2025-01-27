import {Balance, Table, VecMap, VecSet} from "@/api/models/shared-models";

export const errorMessages: Record<string, Record<number, string>> = {
    balance_manager: {
        1: "Balance too low. Your balance is insufficient to complete this action.",
        2: "You are not the owner of this balance manager.",
        3: "You are not allowed to play with this balance manager.",
        4: "You have reached the maximum amount of play caps.",
        5: "The provided play cap is not in the allowed list.",
        6: "The proof you have provided is incorrect."
    },
    house: {
        1: "The house does not have sufficient funds to complete the requested action.",
        2: "The provided transaction cap is invalid. You are not authorized to execute these transactions",
        3: "The provided participation is invalid. Please verify that it is linked to the provided house.",
        4: "The vault is currently not active. Please try again later.",
        5: "The referral program is not enabled for this house.",
        6: "This house is private. Only the administrator can fund it.",
        7: "The maximum number of transaction caps has been reached.",
        8: "The provided transaction cap is not in the allowed list.",
        9: "The provided house admin cap is invalid.",
        10: "The provided fee configuration is invalid.",
    },
    participation: {
        1: "The provided GGR share is invalid.",
        2: "The participation has been requested to be cancelled.",
        3: "The provided epoch does not match the current epoch.",
        4: "The epoch has not finished yet.",
        5: "The provided profits or losses are invalid.",
        6: "The participation is not empty.",
    },
    transaction: {
        1: "The provided transaction type is not supported.",
    },
    vault: {
        1: "The vault does not have sufficient funds to complete the requested action.",
        2: "The vault is currently inactive.",
        3: "The provided referral does not exist.",
    },
    history: {
        1: "The provided epoch does not match the current epoch.",
        2: "You are trying to unstake more than you have staked.",
        3: "The end of day data is not available.",
        4: "The epoch has not finished yet.",
        5: "The volume data is not available.",
        6: "The profits or losses are invalid.",
    },
    state: {
        1: "The provided transaction is not supported.",
    },
};

export interface RegistryModel {
    id: string;
    houses: string[];
    protocol_fee_bps: bigint;
}

export interface VaultModel {
    epoch: number;
    collected_house_fees: Balance;
    collected_protocol_fees: Balance
    collected_referral_fees: VecMap<string, Balance>, // TODO: verify this mapping is ok
    play_balance: Balance;
    reserve_balance: Balance;
    active: boolean
}

export interface VolumesModel {
    total_stake_amount: bigint;
    total_bet_amount: bigint;
    total_win_amount: bigint;
}

export interface EndOfDayModel {
    day_profits: bigint,
    day_losses: bigint
}

export interface HistoryModel {
    epoch: bigint,
    pending_stake: bigint,
    pending_unstake: bigint,
    current_volumes: VolumesModel,
    previous_end_of_day: EndOfDayModel,
    historic_volumes: Table,
    end_of_day_balances: Table,
    all_time_bet_amount: bigint,
    all_time_win_amount: bigint,
    all_time_profits: bigint,
    all_time_losses: bigint
}

export interface StateModel {
    accounts: Table
    history: HistoryModel,
}

export interface HouseModel {
    id: string;
    admin_cap_id: string;
    private: boolean;
    target_balance: bigint;
    house_fee_bps: bigint;
    referral_fee_bps: bigint;
    tx_allow_listed: VecSet<string>;
    vault: VaultModel;
    state: StateModel;
}

export interface HouseAdminCapModel {
    id: string;
    house_id: string;
}

export interface HouseTransactionCapModel {
    id: string;
    house_id: string;
}

export interface AccountModel {
    lifetime_total_bets: bigint;
    lifetime_total_wins: bigint;
    debit_balance: bigint;
    credit_balance: bigint;
}

export interface BalanceManagerModel {
    id: string,
    balance: Balance,
    tx_allow_listed: VecSet<string>
}

export interface BalanceManagerCapModel {
    id: string;
    balance_manager_id: string;
}

export interface PlayCapModel {
    id: string;
    balance_manager_id: string;
}

export interface ParticipationModel {
    id: string;
    house_id: string;
    last_updated_epoch: bigint;
    active_stake: bigint;
    inactive_stake: bigint;
    claimable_balance: bigint;
    unstake_requested: boolean;
}

export interface ReferralModel {
    id: string;
    house_id: string;
    cap_id: string;
}

export interface ReferralCapModel {
    id: string;
    referral_id: string;
}

export interface TransactionModel {
    transaction_type: string;
    amount: bigint;
}