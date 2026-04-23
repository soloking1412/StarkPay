export const VAULT_ABI = [
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      { name: 'employer', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'token', type: 'core::starknet::contract_address::ContractAddress' },
    ],
  },
  {
    type: 'struct',
    name: 'starkpay::types::ContributorInfo',
    members: [
      { name: 'salary', type: 'core::integer::u256' },
      { name: 'interval', type: 'core::integer::u64' },
      { name: 'last_payment', type: 'core::integer::u64' },
      { name: 'pending', type: 'core::integer::u256' },
      { name: 'active', type: 'core::bool' },
    ],
  },
  {
    type: 'struct',
    name: 'starkpay::types::PaymentRecord',
    members: [
      { name: 'contributor', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' },
      { name: 'timestamp', type: 'core::integer::u64' },
      { name: 'record_id', type: 'core::integer::u32' },
    ],
  },
  {
    type: 'interface',
    name: 'starkpay::interfaces::IPayrollVault',
    items: [
      {
        type: 'function',
        name: 'deposit',
        inputs: [{ name: 'amount', type: 'core::integer::u256' }],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'withdraw_excess',
        inputs: [{ name: 'amount', type: 'core::integer::u256' }],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'add_contributor',
        inputs: [
          { name: 'address', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'salary', type: 'core::integer::u256' },
          { name: 'interval', type: 'core::integer::u64' },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'remove_contributor',
        inputs: [
          { name: 'address', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'update_salary',
        inputs: [
          { name: 'address', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'new_salary', type: 'core::integer::u256' },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'process_disbursement',
        inputs: [
          { name: 'contributor', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'process_all_due',
        inputs: [],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'claim',
        inputs: [],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_viewing_key',
        inputs: [{ name: 'key', type: 'core::felt252' }],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'get_vault_balance',
        inputs: [],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_contributor',
        inputs: [
          { name: 'address', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [{ type: 'starkpay::types::ContributorInfo' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_pending',
        inputs: [
          { name: 'address', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_employer',
        inputs: [],
        outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_token',
        inputs: [],
        outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_contributor_count',
        inputs: [],
        outputs: [{ type: 'core::integer::u32' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_contributor_at',
        inputs: [{ name: 'index', type: 'core::integer::u32' }],
        outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'is_contributor',
        inputs: [
          { name: 'address', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_viewing_key',
        inputs: [],
        outputs: [{ type: 'core::felt252' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_payment_count',
        inputs: [],
        outputs: [{ type: 'core::integer::u32' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_payment_record',
        inputs: [{ name: 'index', type: 'core::integer::u32' }],
        outputs: [{ type: 'starkpay::types::PaymentRecord' }],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'event',
    name: 'starkpay::payroll_vault::PayrollVault::Event',
    kind: 'enum',
    variants: [
      { name: 'Deposited', type: 'starkpay::payroll_vault::PayrollVault::Deposited', kind: 'nested' },
      { name: 'Withdrawn', type: 'starkpay::payroll_vault::PayrollVault::Withdrawn', kind: 'nested' },
      { name: 'ContributorAdded', type: 'starkpay::payroll_vault::PayrollVault::ContributorAdded', kind: 'nested' },
      { name: 'ContributorRemoved', type: 'starkpay::payroll_vault::PayrollVault::ContributorRemoved', kind: 'nested' },
      { name: 'SalaryUpdated', type: 'starkpay::payroll_vault::PayrollVault::SalaryUpdated', kind: 'nested' },
      { name: 'DisbursementProcessed', type: 'starkpay::payroll_vault::PayrollVault::DisbursementProcessed', kind: 'nested' },
      { name: 'PaymentClaimed', type: 'starkpay::payroll_vault::PayrollVault::PaymentClaimed', kind: 'nested' },
      { name: 'ViewingKeySet', type: 'starkpay::payroll_vault::PayrollVault::ViewingKeySet', kind: 'nested' },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' },
    ],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'balance_of',
    inputs: [{ name: 'account', type: 'core::starknet::contract_address::ContractAddress' }],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
    ],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
] as const;
