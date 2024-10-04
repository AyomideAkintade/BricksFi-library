"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const idl_json_1 = __importDefault(require("./idl.json"));
const bn_js_1 = __importDefault(require("bn.js"));
const uint8ArrayToUUID_1 = __importDefault(require("./utils/uint8ArrayToUUID"));
const bufferToString_1 = __importDefault(require("./utils/bufferToString"));
const uuidToUint8Array_1 = __importDefault(require("./utils/uuidToUint8Array"));
class BricksProgram {
    constructor(connection, publicKey, signTransaction) {
        if (!connection || !publicKey || !signTransaction) {
            throw new Error("Failed to construct BricksProgram");
        }
        this.connection = connection;
        this.provider = new anchor_1.AnchorProvider(connection, { publicKey, signTransaction }, {});
        this.program = new anchor_1.Program(idl_json_1.default, this.provider);
    }
    parseAssetAccount(account) {
        return {
            key: account.key.toString(),
            id: (0, uint8ArrayToUUID_1.default)(new Uint8Array(account.id)),
            name: (0, bufferToString_1.default)(account.name),
            location: (0, bufferToString_1.default)(account.location),
            images: account.images.map((imageLink) => (0, bufferToString_1.default)(imageLink)),
            virtual_link: (0, bufferToString_1.default)(account.virtualLink),
            num_owners: account.numOwners,
            end_date_timestamp: account.endDateTimestamp.toNumber(),
            value: account.value.toNumber(),
            value_bought: account.valueBought.toNumber(),
            timeline: account.timeline,
            attributes: account.attributes.map(({ key, value }) => {
                return {
                    key: (0, bufferToString_1.default)(key),
                    value: (0, bufferToString_1.default)(value)
                };
            }),
            created_at: account.createdAt.toNumber(),
            updated_at: account.updatedAt.toNumber()
        };
    }
    parseUserAccount(account) {
        try {
            return {
                key: account.key.toString(),
                id: (0, uint8ArrayToUUID_1.default)(new Uint8Array(account.id)),
                owned_assets: account.ownedAssets.map((asset) => asset.toString()),
                ownership_amounts: account.ownershipAmounts.map((amount) => amount.toNumber())
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     *
     * @param {UUID} userId - user id in UUID
     * @returns {Promise<{hash: string, key: string}>} - Returns transaction
     * @throws {Error}
     */
    async initializeUser(userId) {
        try {
            const _userId = (0, uuidToUint8Array_1.default)(userId);
            const [userPDA, _] = web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("user"),
                this.provider.wallet.publicKey.toBuffer(),
                _userId
            ], this.program.programId);
            const tx = await this.program.methods.addUser(_userId).accounts({
                assetAccount: userPDA,
                user: this.provider.wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            }).rpc();
            return { hash: tx, key: userPDA.toString() };
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
    async fetchUser({ userKey }) {
        try {
            const _userKey = new web3_js_1.PublicKey(userKey);
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
    async fetchAllUsers() {
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
    async fetchAsset({ assetKey }) {
        try {
            const _assetKey = new web3_js_1.PublicKey(assetKey);
            const assetAccount = await this.program.account.assetState.fetch(_assetKey);
            console.log(JSON.stringify(assetAccount));
            const parsedAccount = this.parseAssetAccount(assetAccount);
            return parsedAccount;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     *
     * @returns {Promise<Asset[]>}
     */
    async fetchAllAssets() {
        try {
            const assets = await this.program.account.assetState.all();
            const assetsParse = assets.map((asset) => {
                const { account } = asset;
                return this.parseAssetAccount(account);
            });
            return assetsParse;
        }
        catch (err) {
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
    async initializeAsset(params) {
        try {
            const assetId = (0, uuidToUint8Array_1.default)(params.id);
            const assetName = Buffer.from(params.name.padEnd(32, '\0'), 'utf-8');
            const assetLocation = Buffer.from(params.location, 'utf-8');
            const vLink = Buffer.from(params.virtual_link, 'utf-8');
            const formattedAttributes = params.attributes.map(({ key, value }) => {
                const _key = Buffer.from(key, 'utf-8');
                const _value = Buffer.from(value, 'utf-8');
                return { key: _key, value: _value };
            });
            const imagesLinks = params.images.map((imageLink) => Buffer.from(imageLink, 'utf-8'));
            const [assetPDA, _] = web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("asset"),
                this.provider.wallet.publicKey.toBuffer(),
                assetId
            ], this.program.programId // The program ID that owns the PDA
            );
            const timestampBN = new bn_js_1.default(params.end_date_timestamp);
            const valueBN = new bn_js_1.default(params.value);
            const tx = await this.program.methods.initializeAsset(assetId, assetName, assetLocation, formattedAttributes, imagesLinks, vLink, timestampBN, valueBN, []).accounts({
                assetAccount: assetPDA,
                user: this.provider.wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            }).rpc();
            return { hash: tx, key: assetPDA.toString() };
        }
        catch (error) {
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
    async buyAsset(params) {
        try {
            const assetKey = new web3_js_1.PublicKey(params.asset_key);
            const userAccount = new web3_js_1.PublicKey(params.user_account);
            const tx = await this.program.methods.buyAsset(assetKey, new bn_js_1.default(params.amount)).accounts({
                recipient: new web3_js_1.PublicKey("6epEHHWCeLYYqiprybDARQsXoG8cbmNDNVGHMnLy1z9t"),
                asset: assetKey,
                user: userAccount,
                systemProgram: web3_js_1.SystemProgram.programId,
            }).signers([]).rpc();
            return tx;
        }
        catch (err) {
            throw err;
        }
    }
    async getAcccountFromHash(txHash) {
        const transaction = await this.connection.getTransaction(txHash, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' });
        console.log(transaction);
        if (transaction) {
            // Access the public keys from the transaction message
            // const accountKeys = transaction.transaction.message.accountKeys.map(account => account.toBase58());
            // return accountKeys[0];
        }
        else {
            throw new Error('Transaction not found');
        }
    }
}
exports.default = BricksProgram;
__exportStar(require("./interface/asset.interface"), exports);
__exportStar(require("./interface/user.interface"), exports);
__exportStar(require("./utils/bufferToString"), exports);
__exportStar(require("./utils/uint8ArrayToUUID"), exports);
__exportStar(require("./utils/uuidToUint8Array"), exports);
//# sourceMappingURL=index.js.map