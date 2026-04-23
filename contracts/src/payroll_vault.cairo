#[starknet::contract]
pub mod PayrollVault {
    use starknet::{ContractAddress, get_caller_address, get_contract_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        StorageMapReadAccess, StorageMapWriteAccess, Map,
    };
    use starkpay::types::{ContributorInfo, PaymentRecord};
    use starkpay::interfaces::{IERC20Dispatcher, IERC20DispatcherTrait};

    #[storage]
    struct Storage {
        employer: ContractAddress,
        token: ContractAddress,
        vault_balance: u256,
        total_pending: u256,
        viewing_key: felt252,
        contributors: Map::<ContractAddress, ContributorInfo>,
        contributor_list: Map::<u32, ContractAddress>,
        contributor_count: u32,
        is_contributor: Map::<ContractAddress, bool>,
        payment_records: Map::<u32, PaymentRecord>,
        payment_record_count: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Deposited: Deposited,
        Withdrawn: Withdrawn,
        ContributorAdded: ContributorAdded,
        ContributorRemoved: ContributorRemoved,
        SalaryUpdated: SalaryUpdated,
        DisbursementProcessed: DisbursementProcessed,
        PaymentClaimed: PaymentClaimed,
        ViewingKeySet: ViewingKeySet,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Deposited {
        pub employer: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Withdrawn {
        pub employer: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ContributorAdded {
        pub address: ContractAddress,
        pub salary: u256,
        pub interval: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ContributorRemoved {
        pub address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct SalaryUpdated {
        pub address: ContractAddress,
        pub new_salary: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DisbursementProcessed {
        pub contributor: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PaymentClaimed {
        pub contributor: ContractAddress,
        pub amount: u256,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ViewingKeySet {
        pub employer: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, employer: ContractAddress, token: ContractAddress) {
        self.employer.write(employer);
        self.token.write(token);
    }

    #[abi(embed_v0)]
    impl PayrollVaultImpl of starkpay::interfaces::IPayrollVault<ContractState> {
        fn deposit(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            assert(caller == self.employer.read(), 'only employer');
            assert(amount > 0, 'amount must be positive');

            let token = IERC20Dispatcher { contract_address: self.token.read() };
            token.transfer_from(caller, get_contract_address(), amount);
            self.vault_balance.write(self.vault_balance.read() + amount);

            self.emit(Deposited { employer: caller, amount });
        }

        fn withdraw_excess(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            assert(caller == self.employer.read(), 'only employer');
            assert(amount > 0, 'amount must be positive');

            let available = self.vault_balance.read() - self.total_pending.read();
            assert(available >= amount, 'insufficient free balance');

            self.vault_balance.write(self.vault_balance.read() - amount);
            let token = IERC20Dispatcher { contract_address: self.token.read() };
            token.transfer(caller, amount);

            self.emit(Withdrawn { employer: caller, amount });
        }

        fn add_contributor(
            ref self: ContractState,
            address: ContractAddress,
            salary: u256,
            interval: u64,
        ) {
            assert(get_caller_address() == self.employer.read(), 'only employer');
            assert(!self.is_contributor.read(address), 'already a contributor');
            assert(salary > 0, 'salary must be positive');
            assert(interval > 0, 'interval must be positive');

            let info = ContributorInfo {
                salary,
                interval,
                last_payment: get_block_timestamp(),
                pending: 0,
                active: true,
            };
            self.contributors.write(address, info);

            let idx = self.contributor_count.read();
            self.contributor_list.write(idx, address);
            self.contributor_count.write(idx + 1);
            self.is_contributor.write(address, true);

            self.emit(ContributorAdded { address, salary, interval });
        }

        fn remove_contributor(ref self: ContractState, address: ContractAddress) {
            assert(get_caller_address() == self.employer.read(), 'only employer');
            assert(self.is_contributor.read(address), 'not a contributor');

            let mut info = self.contributors.read(address);
            assert(info.pending == 0, 'pending balance must be claimed');
            info.active = false;
            self.contributors.write(address, info);
            self.is_contributor.write(address, false);

            self.emit(ContributorRemoved { address });
        }

        fn update_salary(ref self: ContractState, address: ContractAddress, new_salary: u256) {
            assert(get_caller_address() == self.employer.read(), 'only employer');
            assert(self.is_contributor.read(address), 'not a contributor');
            assert(new_salary > 0, 'salary must be positive');

            let mut info = self.contributors.read(address);
            info.salary = new_salary;
            self.contributors.write(address, info);

            self.emit(SalaryUpdated { address, new_salary });
        }

        fn process_disbursement(ref self: ContractState, contributor: ContractAddress) {
            assert(self.is_contributor.read(contributor), 'not a contributor');
            let mut info = self.contributors.read(contributor);
            assert(info.active, 'contributor not active');

            let now = get_block_timestamp();
            if now >= info.last_payment + info.interval {
                let earned = info.salary;
                assert(
                    self.vault_balance.read() >= self.total_pending.read() + earned,
                    'insufficient vault balance',
                );
                info.pending += earned;
                info.last_payment = now;
                self.contributors.write(contributor, info);
                self.total_pending.write(self.total_pending.read() + earned);

                self.emit(DisbursementProcessed { contributor, amount: earned });
            }
        }

        fn process_all_due(ref self: ContractState) {
            let count = self.contributor_count.read();
            let mut i: u32 = 0;
            loop {
                if i >= count {
                    break;
                }
                let addr = self.contributor_list.read(i);
                let info = self.contributors.read(addr);
                if info.active {
                    let now = get_block_timestamp();
                    if now >= info.last_payment + info.interval {
                        let earned = info.salary;
                        if self.vault_balance.read() >= self.total_pending.read() + earned {
                            let mut updated = info;
                            updated.pending += earned;
                            updated.last_payment = now;
                            self.contributors.write(addr, updated);
                            self.total_pending.write(self.total_pending.read() + earned);
                            self.emit(DisbursementProcessed { contributor: addr, amount: earned });
                        }
                    }
                }
                i += 1;
            }
        }

        fn claim(ref self: ContractState) {
            let caller = get_caller_address();
            assert(self.is_contributor.read(caller), 'not a contributor');

            let mut info = self.contributors.read(caller);
            let amount = info.pending;
            assert(amount > 0, 'nothing to claim');

            info.pending = 0;
            self.contributors.write(caller, info);
            self.vault_balance.write(self.vault_balance.read() - amount);
            self.total_pending.write(self.total_pending.read() - amount);

            let token = IERC20Dispatcher { contract_address: self.token.read() };
            token.transfer(caller, amount);

            let timestamp = get_block_timestamp();
            let record_id = self.payment_record_count.read();
            self.payment_records.write(record_id, PaymentRecord { contributor: caller, amount, timestamp, record_id });
            self.payment_record_count.write(record_id + 1);

            self.emit(PaymentClaimed { contributor: caller, amount, timestamp });
        }

        fn set_viewing_key(ref self: ContractState, key: felt252) {
            assert(get_caller_address() == self.employer.read(), 'only employer');
            self.viewing_key.write(key);
            self.emit(ViewingKeySet { employer: get_caller_address() });
        }

        fn get_vault_balance(self: @ContractState) -> u256 {
            self.vault_balance.read()
        }

        fn get_contributor(self: @ContractState, address: ContractAddress) -> ContributorInfo {
            self.contributors.read(address)
        }

        fn get_pending(self: @ContractState, address: ContractAddress) -> u256 {
            self.contributors.read(address).pending
        }

        fn get_employer(self: @ContractState) -> ContractAddress {
            self.employer.read()
        }

        fn get_token(self: @ContractState) -> ContractAddress {
            self.token.read()
        }

        fn get_contributor_count(self: @ContractState) -> u32 {
            self.contributor_count.read()
        }

        fn get_contributor_at(self: @ContractState, index: u32) -> ContractAddress {
            self.contributor_list.read(index)
        }

        fn is_contributor(self: @ContractState, address: ContractAddress) -> bool {
            self.is_contributor.read(address)
        }

        fn get_viewing_key(self: @ContractState) -> felt252 {
            self.viewing_key.read()
        }

        fn get_payment_count(self: @ContractState) -> u32 {
            self.payment_record_count.read()
        }

        fn get_payment_record(self: @ContractState, index: u32) -> PaymentRecord {
            self.payment_records.read(index)
        }
    }
}
