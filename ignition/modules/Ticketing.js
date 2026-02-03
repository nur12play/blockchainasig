const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TicketingModule", (m) => {
  const ticketing = m.contract("Ticketing");
  return { ticketing };
});
