import {graphql} from '@mysten/sui/graphql/schemas/2024.4';

const packageId = process.env.NEXT_PUBLIC_CORE_PACKAGE_ID;

export const GET_ACCOUNT_BALANCE = graphql(`
    query ($address: String!) {
        address(
            address: $address
        ) {
            balance(
                type: "0x2::sui::SUI"
            ) {
                coinObjectCount
                totalBalance
            }
        }
    }
`);

export const GET_EPOCH_ID = graphql(`
    query {
        epoch {
            epochId
        }
    }
`);

export const GET_MOVE_OBJECT_CONTENTS = graphql(`
    query ($address: String!) {
        object(
            address: $address
        ) {
            asMoveObject {
                contents {
                    json
                }
            }
        }
    }
`);

export const GET_OBJECT_OWNER = graphql(`
    query ($objectId: String!) {
        object(
            address: $objectId
        ) {
            owner {
                __typename
                ... on AddressOwner {
                    owner {
                        address
                    }
                }
                ... on Parent {
                    parent {
                        address
                    }
                }
            }
        }
    }
`);

export const GET_BALANCE_MANAGERS = graphql(`
    query ($address: String!) {
        address(
            address: $address
        ) {
            objects(filter: { type: "${packageId + "::balance_manager" + "::BalanceManager"}" }) {
                nodes {
                    address
                    digest
                    contents {
                        json
                    }
                }
            }
        }
    }
`);

export const GET_PARTICIPATIONS = graphql(`
    query ($address: String!) {
        address(
            address: $address
        ) {
            objects(filter: { type: "${packageId + "::participation" + "::Participation"}" }) {
                nodes {
                    address
                    digest
                    contents {
                        json
                    }
                }
            }
        }
    }
`);

export const GET_HOUSE_ADMIN_CAPS = graphql(`
    query ($address: String!) {
        address(
            address: $address
        ) {
            objects(filter: { type: "${packageId + "::house" + "::HouseAdminCap"}" }) {
                nodes {
                    address
                    digest
                    contents {
                        json
                    }
                }
            }
        }
    }
`);

export const GET_REFERRAL_CAPS = graphql(`
    query ($address: String!) {
        address(
            address: $address
        ) {
            objects(filter: { type: "${packageId + "::referral" + "::ReferralCap"}" }) {
                nodes {
                    address
                    digest
                    contents {
                        json
                    }
                }
            }
        }
    }
`);

export const GET_REGISTRY = graphql(`
    query {
        objects(filter: { type: "${packageId + "::registry" + "::Registry"}" }) {
            nodes {
                address
                digest
                asMoveObject {
                    contents { 
                        json
                    }
                }
            }
        }
    }
`);

export const GET_DYNAMIC_VALUE = graphql(`
    query ($owner: String!, $type: String!, $bcs: String!) {
        owner(address: $owner) {
            dynamicField (
                name: {
                    type: $type
                    bcs: $bcs
                }
            ) {
                value {
                    __typename
                    ... on MoveValue {
                        ...Value
                    }
                }
            }
        }
    }

    fragment Value on MoveValue {
        type {
            repr
        }
        json
    }
`);