const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("mpcModule", (m) => {
    const account0Address = m.getAccount(0);
    const account1Address = m.getAccount(1);

    const mpc = m.contract("MPC", [account0Address], {
        from: account1Address,
        value: 5n * 10n ** 18n,  // 5 ether in wei
    });

    return { mpc };
});
