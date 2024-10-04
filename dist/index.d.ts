import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from "@coral-xyz/anchor";
import { AddAsset, Asset, BuyAsset } from './interface/asset.interface';
import { UUID } from 'crypto';
import { User } from './interface/user.interface';
export default class BricksProgram {
    connection: Connection;
    provider: AnchorProvider;
    program: any;
    constructor(connection: Connection, publicKey: PublicKey, signTransaction: any);
    private parseAssetAccount;
    private parseUserAccount;
    /**
     *
     * @param {UUID} userId - user id in UUID
     * @returns {Promise<{hash: string, key: string}>} - Returns transaction
     * @throws {Error}
     */
    initializeUser(userId: UUID): Promise<{
        hash: string;
        key: string;
    }>;
    /**
     *
     * @param {string} userKey - account key for user
     * @returns {Promise<User>}
     * @throws {Error}
     */
    fetchUser({ userKey }: {
        userKey: string;
    }): Promise<User>;
    /**
     *
     * @returns {Promise<User[]>}
     */
    fetchAllUsers(): Promise<User[]>;
    /**
     *
     * @param {string} params.assetKey
     * @returns {Promise<Asset>}
     */
    fetchAsset({ assetKey }: {
        assetKey: string;
    }): Promise<Asset>;
    /**
     *
     * @returns {Promise<Asset[]>}
     */
    fetchAllAssets(): Promise<Asset[]>;
    /**
     *
     * @param {AddAsset} params
     * @param {UUID} params.id - asset id
     * @param {string} params.name - name of the asset
     * @param {string} params.location - asset location
     * @param {AssetAttribute[]} params.attributes - attributes
     * @param {string[]} params.images - links to images
     * @param {string} params.virtual_link - link to 3D view
     * @param {number} params.end_date_timestamp - timestamp
     * @param {number} params.value - value of asset in $SOL
     * @param {AssetTimeline[]} params.timeline - timeline of the asset
     * @returns {Promise<{string, string}>} - Returns the transaction ID if asset creation was successful.
     * @throws {Error}
     */
    initializeAsset(params: AddAsset): Promise<{
        hash: string;
        key: string;
    }>;
    /**
     * Executes a transaction to purchase an asset on behalf of a user.
     *
     * @param {BuyAsset} params - The parameters for purchasing the asset.
     * @param {string} params.user_account - The public key of the user's account in base58 format.
     * @param {string} params.asset_key - The public key of the asset being purchased, in base58 format.
     * @param {number} params.amount - The number of asset shares or the value to purchase.
     * @returns {Promise<string>} - Returns the transaction ID of the successful purchase.
     * @throws {Error} - Throws an error if the transaction fails.
     */
    buyAsset(params: BuyAsset): Promise<string>;
    private getAcccountFromHash;
}
export * from './interface/asset.interface';
export * from './interface/user.interface';
export * from './utils/bufferToString';
export * from './utils/uint8ArrayToUUID';
export * from './utils/uuidToUint8Array';
