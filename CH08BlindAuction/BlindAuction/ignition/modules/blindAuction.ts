import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlindAuction", (m) => {
  const blindAuction = m.contract("BlindAuction");
  return { blindAuction };
});
