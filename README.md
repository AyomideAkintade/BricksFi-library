# Bricks

This pacakge allows you to interact with every Bricks program on Solana

## Installation

This documentation provides step-by-step instructions to install and link the necessary libraries for your project.

### Step 1: Clone the Repository

Begin by cloning the repository to your local machine. Open your terminal and run the following command:

```bash
git clone https://github.com/{user}/bricks-lib.git
cd bricks-lib
```

### Step 2: Link the library globally
```bash
npm link
```

### Step 3: Link the libary to your project
```bash
cd path/to/your/project
npm link bricks-lib
```

## Usages
This part expects you to have @solana/wallet-adapter-react installed

### Initializing BricksProgram
```javascript
import BricksProgram from 'bricks-lib';

function TestComponent(){
    const { publicKey, signTransaction } = useWallet();
    const {connection} = useConnection();
    // with wallet
    const bricks = new BricksProgram(connection, publicKey, signTransaction);
    // without wallet
    const bricks = new BricksProgram(connection); // used for read-only functions
}
```

### Creating an Asset
**Parameters**
- `id` (UUID)
- `name` (string)
- `location` (string)
- `attributes` (AssetAttribute[])
    - AssetAttribute
        - `key` (string)
        - `value` (string)
- `images` (string[])
- `virtual_link` (string)
- `end_date_timestamp` (number)
- `value` (number) - value of asset in sol
- `timeline` (AssetTimeline[])
    - AssetTimeline
        - `title` (string)
        - `timestamp` (number)
        - `description` (string)  

**Implementation**
```js
const assetId = crypto.randomUUID();
const assetName = "Name of the Asset";
const assetLocation = "";
const attributes = [{key: "Color", value: "Red"}, {key: "Height", value: "8.13m"}];
const images = ["https://link1.com/image.png", "https://link2.com/image.png"]
const vLink = "https://link1.com/image.png";
const end_date_timestamp = new Date().getTime();
const value = 10000 // SOL
const timeline = []

// Promise
bricks.initializeAsset({
    id: assetId,
    name: assetName,
    location: assetLocation,
    attributes: attributes,
    images: images,
    virtual_link: vLink,
    end_date_timestamp: end_date_timestamp,
    value: value,
    timeline: []
});
```
**Response**
```json
{
    "hash": "3aJ7j4Z6x3cSJMskiTqzibA6B63J5TZi8TJsVkjKGthvrVojr22kjPvbMG12VhEjcZed7bkkpg7jFhmX7AzYnt5X",
    "key": "5RtT8ps5tYxiMxWrnzwxaUuRxHjxSSMv1ZnwRLgEBqnT"
}
```


### Fetching Assets
Fetching assets
**Implementation**
```js
bricks.fetchAllAssets()
.then((assets)=>{
    // do what you want with assets
})
.catch((error)=>{ 
    console.error(error);
 });
```
**Response**
```json
[
    {
        "key": "1368LfqLtSrcWky1CVoewtHr7W7DjCc3GiNc8E4tCcBh",
        "id": "4c22d658-6cc2-43f2-9961-7a23587fdb5d",
        "name": "Palm Beach House",
        "location": "Somewhere in the Valley filled with love",
        "images": [
            "https://link1.com/image.pnghttps://link2.com/image.png",
            ""
        ],
        "virtual_link": "https://link1.com/image.png",
        "num_owners": 2,
        "end_date_timestamp": 1727968762923,
        "value": 10000,
        "value_bought": 56,
        "timeline": [],
        "attributes": [
            {
                "key": "Color",
                "value": "RedHeight"
            },
            {
                "key": "8.13m",
                "value": ""
            }
        ],
        "created_at": 1727968764,
        "updated_at": 1727968764
    },
    ...
]
```


### Fetching a Particular Asset
**Parameters**
- `accountKey` (string) - asset's account key e.g `9hmDYVNs1UZbRHUUpeNg2VNiV3MCT8UHBHgKLaU8MBze`

**Implementation**
```js
bricks.fetchAsset({assetKey: accountKey})
.then((asset)=>{
    // do what you want with asset
})
.catch((error)=>{
    console.error(error);
});
```

**Response**
```json
{
    "key": "1368LfqLtSrcWky1CVoewtHr7W7DjCc3GiNc8E4tCcBh",
    "id": "4c22d658-6cc2-43f2-9961-7a23587fdb5d",
    "name": "Palm Beach House",
    "location": "Somewhere in the Valley filled with love",
    "images": [
        "https://link1.com/image.pnghttps://link2.com/image.png",
        ""
    ],
    "virtual_link": "https://link1.com/image.png",
    "num_owners": 2,
    "end_date_timestamp": 1727968762923,
    "value": 10000,
    "value_bought": 56,
    "timeline": [],
    "attributes": [
        {
            "key": "Color",
            "value": "RedHeight"
        },
        {
            "key": "8.13m",
            "value": ""
        }
    ],
    "created_at": 1727968764,
    "updated_at": 1727968764
},
```

### Initializing a User
Create a user
**Parameters**
- `userId` (UUID) - unique ID given to the user
**Implementation**
```js
bricks.initializeUser(userId)
.then((tx)=>{
    // do what you want with signature (tx)
})
.catch((error)=>{
    console.error(error);
});
```
**Response**
```json
{
    "hash": "3aJ7j4Z6x3cSJMskiTqzibA6B63J5TZi8TJsVkjKGthvrVojr22kjPvbMG12VhEjcZed7bkkpg7jFhmX7AzYnt5X",
    "key": "5RtT8ps5tYxiMxWrnzwxaUuRxHjxSSMv1ZnwRLgEBqnT"
}
```


### Fetching Users
Fetching all users
**Implementation**
```js
bricks.fetchAllUsers()
.then((users)=>{
    // do what you want with assets
})
.catch((error)=>{ 
    console.error(error);
 });
```
**Response**
```json
[
    {
        "key": "9hmDYVNs1UZbRHUUpeNg2VNiV3MCT8UHBHgKLaU8MBze",
        "id": "9663367f-a1f4-4de3-9e06-de00e3797bdc",
        "owned_assets": [
            "1368LfqLtSrcWky1CVoewtHr7W7DjCc3GiNc8E4tCcBh"
        ],
        "ownership_amounts": [
            2
        ]
    },
    {
        "key": "6BWtAXEdzSJgJvLgS4WPpLdG7z89G9UdXyLyJsXbmWgd",
        "id": "cf447238-39b2-49cd-8465-21ef29c85c9b",
        "owned_assets": [],
        "ownership_amounts": []
    },

]
```


### Fetching a Particular User
**Parameters**
- `accountKey` (string) - user's account key e.g `9hmDYVNs1UZbRHUUpeNg2VNiV3MCT8UHBHgKLaU8MBze`

**Implementation**
```js
bricks.fetchUser({userKey: accountKey})
.then((asset)=>{
    // do what you want with asset
})
.catch((error)=>{
    console.error(error);
});
```

**Response**
```json
{
    "key": "6BWtAXEdzSJgJvLgS4WPpLdG7z89G9UdXyLyJsXbmWgd",
    "id": "cf447238-39b2-49cd-8465-21ef29c85c9b",
    "owned_assets": [],
    "ownership_amounts": []
}
```