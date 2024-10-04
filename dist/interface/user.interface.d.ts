import { UUID } from "crypto";
interface User {
    key: string;
    id: UUID;
    owned_assets: string[];
    ownership_amounts: number[];
}
interface AddUser {
    id: UUID;
}
export { User, AddUser };
