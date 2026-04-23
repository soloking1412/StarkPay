use starknet::ContractAddress;
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address, start_cheat_block_timestamp, stop_cheat_block_timestamp,
};
use starkpay::interfaces::{IPayrollVaultDispatcher, IPayrollVaultDispatcherTrait};
use starkpay::mock_erc20::{IMockERC20Dispatcher, IMockERC20DispatcherTrait};
use starkpay::types::WEEKLY;

fn EMPLOYER() -> ContractAddress {
    'employer'.try_into().unwrap()
}

fn CONTRIBUTOR_1() -> ContractAddress {
    'contributor1'.try_into().unwrap()
}

fn CONTRIBUTOR_2() -> ContractAddress {
    'contributor2'.try_into().unwrap()
}

fn STRANGER() -> ContractAddress {
    'stranger'.try_into().unwrap()
}

fn deploy_token() -> ContractAddress {
    let class = declare("MockERC20").unwrap().contract_class();
    let (addr, _) = class.deploy(@array![]).unwrap();
    addr
}

fn deploy_vault(token: ContractAddress) -> ContractAddress {
    let class = declare("PayrollVault").unwrap().contract_class();
    let mut calldata = array![];
    calldata.append(EMPLOYER().into());
    calldata.append(token.into());
    let (addr, _) = class.deploy(@calldata).unwrap();
    addr
}

fn setup() -> (IPayrollVaultDispatcher, IMockERC20Dispatcher) {
    let token_addr = deploy_token();
    let vault_addr = deploy_vault(token_addr);
    let vault = IPayrollVaultDispatcher { contract_address: vault_addr };
    let token = IMockERC20Dispatcher { contract_address: token_addr };
    (vault, token)
}

#[test]
fn test_deposit() {
    let (vault, token) = setup();
    let amount: u256 = 1000_000_000;

    token.mint(EMPLOYER(), amount);

    start_cheat_caller_address(token.contract_address, EMPLOYER());
    token.approve(vault.contract_address, amount);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.deposit(amount);
    stop_cheat_caller_address(vault.contract_address);

    assert(vault.get_vault_balance() == amount, 'wrong vault balance');
}

#[test]
fn test_add_contributor() {
    let (vault, token) = setup();
    let salary: u256 = 500_000_000;

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.add_contributor(CONTRIBUTOR_1(), salary, WEEKLY.into());
    stop_cheat_caller_address(vault.contract_address);

    assert(vault.is_contributor(CONTRIBUTOR_1()), 'should be contributor');
    let info = vault.get_contributor(CONTRIBUTOR_1());
    assert(info.salary == salary, 'wrong salary');
    assert(info.interval == WEEKLY.into(), 'wrong interval');
    assert(info.active, 'should be active');
    assert(vault.get_contributor_count() == 1, 'wrong count');
}

#[test]
#[should_panic(expected: ('only employer',))]
fn test_only_employer_can_add() {
    let (vault, _) = setup();

    start_cheat_caller_address(vault.contract_address, STRANGER());
    vault.add_contributor(CONTRIBUTOR_1(), 500_000_000, WEEKLY.into());
    stop_cheat_caller_address(vault.contract_address);
}

#[test]
fn test_process_and_claim() {
    let (vault, token) = setup();
    let deposit_amount: u256 = 2_000_000_000;
    let salary: u256 = 500_000_000;

    token.mint(EMPLOYER(), deposit_amount);
    start_cheat_caller_address(token.contract_address, EMPLOYER());
    token.approve(vault.contract_address, deposit_amount);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.deposit(deposit_amount);
    vault.add_contributor(CONTRIBUTOR_1(), salary, WEEKLY.into());
    stop_cheat_caller_address(vault.contract_address);

    start_cheat_block_timestamp(vault.contract_address, WEEKLY.into() + 1);
    vault.process_disbursement(CONTRIBUTOR_1());
    stop_cheat_block_timestamp(vault.contract_address);

    assert(vault.get_pending(CONTRIBUTOR_1()) == salary, 'wrong pending');

    start_cheat_caller_address(vault.contract_address, CONTRIBUTOR_1());
    start_cheat_block_timestamp(vault.contract_address, WEEKLY.into() + 1);
    vault.claim();
    stop_cheat_block_timestamp(vault.contract_address);
    stop_cheat_caller_address(vault.contract_address);

    assert(token.balance_of(CONTRIBUTOR_1()) == salary, 'wrong token balance');
    assert(vault.get_pending(CONTRIBUTOR_1()) == 0, 'pending should be zero');
    assert(vault.get_payment_count() == 1, 'wrong payment count');
}

#[test]
#[should_panic(expected: ('nothing to claim',))]
fn test_cannot_double_claim() {
    let (vault, token) = setup();
    let deposit_amount: u256 = 2_000_000_000;
    let salary: u256 = 500_000_000;

    token.mint(EMPLOYER(), deposit_amount);
    start_cheat_caller_address(token.contract_address, EMPLOYER());
    token.approve(vault.contract_address, deposit_amount);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.deposit(deposit_amount);
    vault.add_contributor(CONTRIBUTOR_1(), salary, WEEKLY.into());
    stop_cheat_caller_address(vault.contract_address);

    start_cheat_block_timestamp(vault.contract_address, WEEKLY.into() + 1);
    vault.process_disbursement(CONTRIBUTOR_1());

    start_cheat_caller_address(vault.contract_address, CONTRIBUTOR_1());
    vault.claim();
    vault.claim();
    stop_cheat_caller_address(vault.contract_address);
    stop_cheat_block_timestamp(vault.contract_address);
}

#[test]
fn test_withdraw_excess() {
    let (vault, token) = setup();
    let deposit_amount: u256 = 1_000_000_000;

    token.mint(EMPLOYER(), deposit_amount);
    start_cheat_caller_address(token.contract_address, EMPLOYER());
    token.approve(vault.contract_address, deposit_amount);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.deposit(deposit_amount);
    vault.withdraw_excess(deposit_amount);
    stop_cheat_caller_address(vault.contract_address);

    assert(vault.get_vault_balance() == 0, 'balance should be zero');
    assert(token.balance_of(EMPLOYER()) == deposit_amount, 'employer should have funds');
}

#[test]
fn test_process_all_due() {
    let (vault, token) = setup();
    let deposit_amount: u256 = 4_000_000_000;
    let salary: u256 = 500_000_000;

    token.mint(EMPLOYER(), deposit_amount);
    start_cheat_caller_address(token.contract_address, EMPLOYER());
    token.approve(vault.contract_address, deposit_amount);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.deposit(deposit_amount);
    vault.add_contributor(CONTRIBUTOR_1(), salary, WEEKLY.into());
    vault.add_contributor(CONTRIBUTOR_2(), salary, WEEKLY.into());
    stop_cheat_caller_address(vault.contract_address);

    start_cheat_block_timestamp(vault.contract_address, WEEKLY.into() + 1);
    vault.process_all_due();
    stop_cheat_block_timestamp(vault.contract_address);

    assert(vault.get_pending(CONTRIBUTOR_1()) == salary, 'c1 wrong pending');
    assert(vault.get_pending(CONTRIBUTOR_2()) == salary, 'c2 wrong pending');
}

#[test]
fn test_viewing_key() {
    let (vault, _) = setup();
    let key: felt252 = 0x1234abcd;

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.set_viewing_key(key);
    stop_cheat_caller_address(vault.contract_address);

    assert(vault.get_viewing_key() == key, 'wrong viewing key');
}

#[test]
fn test_update_salary() {
    let (vault, _) = setup();

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.add_contributor(CONTRIBUTOR_1(), 500_000_000, WEEKLY.into());
    vault.update_salary(CONTRIBUTOR_1(), 750_000_000);
    stop_cheat_caller_address(vault.contract_address);

    let info = vault.get_contributor(CONTRIBUTOR_1());
    assert(info.salary == 750_000_000, 'salary not updated');
}

#[test]
#[fuzzer(runs: 256, seed: 42)]
fn fuzz_salary_never_exceeds_deposit(salary_raw: u64, deposit_raw: u64) {
    let salary: u256 = (salary_raw % 1_000_000 + 1).into();
    let deposit: u256 = (deposit_raw % 10_000_000 + salary.try_into().unwrap()).into();

    let (vault, token) = setup();

    token.mint(EMPLOYER(), deposit);
    start_cheat_caller_address(token.contract_address, EMPLOYER());
    token.approve(vault.contract_address, deposit);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_caller_address(vault.contract_address, EMPLOYER());
    vault.deposit(deposit);
    vault.add_contributor(CONTRIBUTOR_1(), salary, WEEKLY.into());
    stop_cheat_caller_address(vault.contract_address);

    start_cheat_block_timestamp(vault.contract_address, WEEKLY.into() + 1);
    vault.process_disbursement(CONTRIBUTOR_1());
    stop_cheat_block_timestamp(vault.contract_address);

    let pending = vault.get_pending(CONTRIBUTOR_1());
    let balance = vault.get_vault_balance();
    assert(balance >= pending, 'balance must cover pending');
}
