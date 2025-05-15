const counterContractAddress = '0x8BE4649e86Ac2cEcA8429FdD0ec17ecE749D9C60';

const counterContractAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// Export with type assertion
export const calls = [
  {
    address: counterContractAddress,
    abi: counterContractAbi,
    functionName: 'increment',
    args: [],
  },
] as any; 