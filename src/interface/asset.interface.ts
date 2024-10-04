import { UUID } from "crypto";
import web3, { PublicKey } from '@solana/web3.js';

interface Asset {
    key: string,
    id: UUID,
    name: string,
    location: string,
    attributes: AssetAttribute[],
    images: string[],
    virtual_link: string,
    end_date_timestamp: number,
    num_owners: number,
    value: number,
    value_bought: number,
    timeline: AssetTimeline[],
    created_at: number,
    updated_at: number
}

interface AssetAttribute {
    key: string,
    value: any
}

interface AssetTimeline {
    title: string,
    timestamp: number,
    description: string
}

interface AddAsset {
    id: UUID,
    name: string,
    location: string,
    attributes: AssetAttribute[],
    images: string[],
    virtual_link: string,
    end_date_timestamp: number,
    value: number,
    timeline: AssetTimeline[],
}

/**
 * Represents the parameters required to buy an asset.
 */
interface BuyAsset {
    /**
     * The public key of the user's account in base58 format.
     */
    user_account: string;

    /**
     * The public key of the asset being purchased, in base58 format.
     */
    asset_key: string;

    /**
     * The amount or number of shares the user wishes to purchase.
     */
    amount: number;
}

export { Asset, AddAsset, AssetTimeline, AssetAttribute, BuyAsset };