import web3, { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, Wallet } from "@coral-xyz/anchor";
import idl from './idl.json';
import BN from 'bn.js';

import { AddAsset, Asset, AssetAttribute, AssetTimeline, BuyAsset } from './interface/asset.interface';
import uint8ArrayToUUID from './utils/uint8ArrayToUUID';
import bufferToString from './utils/bufferToString';
import { UUID } from 'crypto';
import uuidToUint8Array from './utils/uuidToUint8Array';
import { User } from './interface/user.interface';


export default class BricksProgram {
    connection: Connection;
    provider: AnchorProvider;
    program;

    constructor(connection: Connection, publicKey?: PublicKey, signTransaction?){
        if(!connection) {
            throw new Error("Failed to construct BricksProgram");
        }

        this.connection = connection;
        
        if(publicKey && signTransaction){
            this.provider = new AnchorProvider(connection, { publicKey, signTransaction } as Wallet, {});
            this.program = new Program(idl as Idl, this.provider);
        }
        else {
            this.provider = new AnchorProvider(connection, null, AnchorProvider.defaultOptions());
            this.program = new Program(idl as Idl, this.provider);
        }
    }

    private parseAssetAccount(account) : Asset {
        return {
            key: account.key.toString(),
            id: uint8ArrayToUUID(new Uint8Array(account.id)),
            name: bufferToString(account.name),
            location: bufferToString(account.location),
            images: account.images.map((imageLink)=>bufferToString(imageLink)),
            virtual_link: bufferToString(account.virtualLink),
            num_owners: account.numOwners,
            end_date_timestamp: account.endDateTimestamp.toNumber(),
            value: account.value.toNumber(),
            value_bought: account.valueBought.toNumber(),
            timeline: account.timeline,
            attributes: account.attributes.map(({ key, value }) => {
                return {
                    key: bufferToString(key),
                    value: bufferToString(value)
                }
            }),
            created_at: account.createdAt.toNumber(),
            updated_at: account.updatedAt.toNumber()
        }
    }

    private parseUserAccount(account) : User {
        try {
            return {
                key: account.key.toString(),
                id: uint8ArrayToUUID(new Uint8Array(account.id)),
                owned_assets: account.ownedAssets.map((asset) => asset.toString()),
                ownership_amounts: account.ownershipAmounts.map((amount)=>amount.toNumber())
            }
        }
        catch(error){
            throw error;
        }
    }

    /**
     * 
     * @param {UUID} userId - user id in UUID
     * @returns {Promise<{hash: string, key: string}>} - Returns transaction
     * @throws {Error}
     */

    async initializeUser(userId: UUID): Promise<{hash: string, key: string}>{
        if (!this.provider.wallet || !this.provider.wallet.publicKey) {
            throw new Error("Can't use this function without initializing BricksProgram with 'publicKey' and 'signTransaction'");
        }
        try {
            const _userId = uuidToUint8Array(userId);
            const [userPDA, _] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("user"), 
                    this.provider.wallet.publicKey.toBuffer(), 
                    _userId
                ],
                this.program.programId
            );


            const tx = await this.program.methods.addUser(
                _userId
                ).accounts({
                    assetAccount: userPDA,
                    user: this.provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                }).rpc();

            return { hash: tx, key: userPDA.toString()};            
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param {string} userKey - account key for user
     * @returns {Promise<User>} 
     * @throws {Error}
     */

    async fetchUser({userKey}: {userKey: string}): Promise<User>{
        try {
            const _userKey = new PublicKey(userKey);
            const userAccount = await this.program.account.userState.fetch(_userKey);

            return this.parseUserAccount(userAccount);

        }
        catch (error) {
            throw error;
        }

    }
    /**
     * 
     * @returns {Promise<User[]>}
     */
    async fetchAllUsers(): Promise<User[]>{
        try {
            const allUsers = await this.program.account.userState.all();
            return allUsers.map((user) => this.parseUserAccount(user.account));
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param {string} params.assetKey 
     * @returns {Promise<Asset>}
     */

    async fetchAsset({ assetKey } : {assetKey: string}): Promise<Asset>{
        try {
            const _assetKey = new PublicKey(assetKey);
            const assetAccount = await this.program.account.assetState.fetch(_assetKey);
            
            console.log(JSON.stringify(assetAccount));
            const parsedAccount = this.parseAssetAccount(assetAccount);

            return parsedAccount;

        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @returns {Promise<Asset[]>}
     */

    async fetchAllAssets(): Promise<Asset[]>{
        try {
            const assets = await this.program.account.assetState.all();
            const assetsParse = assets.map((asset: { account: any; })=>{
                const { account } = asset;
                return this.parseAssetAccount(account);
            })
    
            return assetsParse;
        }
        catch (err){
            throw err;
        } 
    }

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
    async initializeAsset(params: AddAsset): Promise<{hash: string, key: string}>{
        if (!this.provider.wallet || !this.provider.wallet.publicKey) {
            throw new Error("Can't use this function without initializing BricksProgram with 'publicKey' and 'signTransaction'");
        }
        try {
            const assetId = uuidToUint8Array(params.id);
            const assetName = Buffer.from(params.name.padEnd(32, '\0'), 'utf-8');
            const assetLocation = Buffer.from(params.location, 'utf-8');
            const vLink =  Buffer.from(params.virtual_link, 'utf-8');
    
            const formattedAttributes = params.attributes.map(({key, value}) => {
                const _key = Buffer.from(key, 'utf-8');
                const _value = Buffer.from(value, 'utf-8');
                return {key: _key, value: _value};
            });
        
    
            const imagesLinks = params.images.map((imageLink) => Buffer.from(imageLink, 'utf-8'));
    
            const [assetPDA, _] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("asset"), 
                    this.provider.wallet.publicKey.toBuffer(), 
                    assetId
                ],
                this.program.programId // The program ID that owns the PDA
            );
    
            const timestampBN = new BN(params.end_date_timestamp);
            const valueBN = new BN(params.value);
    
    
            const tx = await this.program.methods.initializeAsset(
                assetId,
                assetName,
                assetLocation,
                formattedAttributes,
                imagesLinks,
                vLink,
                timestampBN,
                valueBN,
                [],
                ).accounts({
                        assetAccount: assetPDA,
                        user: this.provider.wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                }).rpc();

                return { hash: tx, key: assetPDA.toString()};
        } catch (error) {
            throw error;
        }
    }
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
    async buyAsset(params: BuyAsset): Promise<string>{
        if (!this.provider.wallet || !this.provider.wallet.publicKey) {
            throw new Error("Can't use this function without initializing BricksProgram with 'publicKey' and 'signTransaction'");
        }
        try {
            const assetKey = new PublicKey(params.asset_key);
            const userAccount = new PublicKey(params.user_account);
        

            const tx = await this.program.methods.buyAsset(assetKey, new BN(params.amount)).accounts({
                recipient: new PublicKey("6epEHHWCeLYYqiprybDARQsXoG8cbmNDNVGHMnLy1z9t"),
                asset: assetKey,
                user: userAccount,
                systemProgram: SystemProgram.programId,
            }).signers([]).rpc();
        
            return tx;
        } catch (err) {
            throw err;
        }
    
    }

    private async getAcccountFromHash(txHash: string) {
        const transaction = await this.connection.getTransaction(txHash, { maxSupportedTransactionVersion: 0,  commitment: 'confirmed' });
        console.log(transaction);
        if (transaction) {

            // Access the public keys from the transaction message
            // const accountKeys = transaction.transaction.message.accountKeys.map(account => account.toBase58());
            // return accountKeys[0];
        } else {
            throw new Error('Transaction not found');
        }
    }
}



export * from './interface/asset.interface';
export * from './interface/user.interface';
export * from './utils/bufferToString';
export * from './utils/uint8ArrayToUUID';
export * from './utils/uuidToUint8Array';