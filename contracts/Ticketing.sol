// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ticketing is ERC721URIStorage, Ownable {
    uint256 public nextTicketId;

    struct EventInfo {
        string name;
        uint256 date;     // unix timestamp or any numeric date
        bool active;
    }

    mapping(uint256 => EventInfo) public eventsById;
    mapping(uint256 => uint256) public ticketToEvent; // ticketId -> eventId

    event EventCreated(uint256 indexed eventId, string name, uint256 date);
    event TicketMinted(uint256 indexed eventId, uint256 indexed ticketId, address indexed to);

    constructor() ERC721("Event Ticket", "TIX") Ownable(msg.sender) {}

    function createEvent(uint256 eventId, string calldata name, uint256 date) external onlyOwner {
        require(!eventsById[eventId].active, "Event exists");
        eventsById[eventId] = EventInfo(name, date, true);
        emit EventCreated(eventId, name, date);
    }

    function mintTicket(address to, uint256 eventId, string calldata uri) external onlyOwner returns (uint256) {
        require(eventsById[eventId].active, "Event not active");

        uint256 ticketId = nextTicketId++;
        _safeMint(to, ticketId);
        _setTokenURI(ticketId, uri);

        ticketToEvent[ticketId] = eventId;
        emit TicketMinted(eventId, ticketId, to);

        return ticketId;
    }

    function verifyTicket(uint256 ticketId) external view returns (bool valid, uint256 eventId, address owner) {
        owner = ownerOf(ticketId);
        eventId = ticketToEvent[ticketId];
        valid = eventsById[eventId].active;
    }

    function deactivateEvent(uint256 eventId) external onlyOwner {
        require(eventsById[eventId].active, "Not active");
        eventsById[eventId].active = false;
    }
}
