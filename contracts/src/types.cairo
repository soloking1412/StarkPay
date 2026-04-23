use starknet::ContractAddress;

pub const WEEKLY: u64 = 604800;
pub const BIWEEKLY: u64 = 1209600;
pub const MONTHLY: u64 = 2592000;

#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct ContributorInfo {
    pub salary: u256,
    pub interval: u64,
    pub last_payment: u64,
    pub pending: u256,
    pub active: bool,
}

#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct PaymentRecord {
    pub contributor: ContractAddress,
    pub amount: u256,
    pub timestamp: u64,
    pub record_id: u32,
}
