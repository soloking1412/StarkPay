use starknet::ContractAddress;
use starkpay::types::{ContributorInfo, PaymentRecord};

#[starknet::interface]
pub trait IPayrollVault<TState> {
    fn deposit(ref self: TState, amount: u256);
    fn withdraw_excess(ref self: TState, amount: u256);
    fn add_contributor(ref self: TState, address: ContractAddress, salary: u256, interval: u64);
    fn remove_contributor(ref self: TState, address: ContractAddress);
    fn update_salary(ref self: TState, address: ContractAddress, new_salary: u256);
    fn process_disbursement(ref self: TState, contributor: ContractAddress);
    fn process_all_due(ref self: TState);
    fn claim(ref self: TState);
    fn set_viewing_key(ref self: TState, key: felt252);
    fn get_vault_balance(self: @TState) -> u256;
    fn get_contributor(self: @TState, address: ContractAddress) -> ContributorInfo;
    fn get_pending(self: @TState, address: ContractAddress) -> u256;
    fn get_employer(self: @TState) -> ContractAddress;
    fn get_token(self: @TState) -> ContractAddress;
    fn get_contributor_count(self: @TState) -> u32;
    fn get_contributor_at(self: @TState, index: u32) -> ContractAddress;
    fn is_contributor(self: @TState, address: ContractAddress) -> bool;
    fn get_viewing_key(self: @TState) -> felt252;
    fn get_payment_count(self: @TState) -> u32;
    fn get_payment_record(self: @TState, index: u32) -> PaymentRecord;
}

#[starknet::interface]
pub trait IERC20<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256,
    ) -> bool;
    fn approve(ref self: TState, spender: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TState, account: ContractAddress) -> u256;
    fn allowance(self: @TState, owner: ContractAddress, spender: ContractAddress) -> u256;
}
