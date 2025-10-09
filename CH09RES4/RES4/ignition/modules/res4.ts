import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("res4Module", (m) => {
  const res4 = m.contract("ERC721RES4");
  return { res4 };
});
