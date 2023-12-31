// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

//OpenZeppelin helps us keep track of tokenIds
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import {StringUtils} from "./libraries/StringUtils.sol";

// We inherit the contract we imported. This means we'll have access to the inherited contract's methods.
import "hardhat/console.sol";

contract Domains is ERC721URIStorage {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string public tld;
  
  // We'll be storing our NFT images on chain as SVGs
  string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-10.081 6.032-6.85 3.934-10.081 6.032c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616c-.384-.665-.594-1.418-.608-2.187v-9.31c-.013-.775.185-1.538.572-2.208a4.25 4.25 0 0 1 1.625-1.595l7.884-4.59c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v6.032l6.85-4.065v-6.032c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595L41.456 24.59c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595c-.387.67-.585 1.434-.572 2.208v17.441c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l10.081-5.901 6.85-4.065 10.081-5.901c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v9.311c.013.775-.185 1.538-.572 2.208a4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616c-.385-.665-.594-1.418-.608-2.187v-6.032l-6.85 4.065v6.032c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l14.864-8.655c.657-.394 1.204-.95 1.589-1.616s.594-1.418.609-2.187V55.538c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#fff"/><defs><linearGradient id="B" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#b12a5b"/><stop offset="1" stop-color="#ff8177" stop-opacity=".93"/></linearGradient></defs><text x="50%" y="231" text-anchor="middle" font-size="20" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif">';
  string svgPartTwo = '</text></svg>';

  mapping(string => address) public domains; // Maps domain names to their respective owners' addresses
  mapping(string => string) public records; // Maps domain names to associated records.
  mapping (uint => string) public names; // Maps token IDs to domain names.

  address payable public owner; //Stores the address of the contract owner.

  // Constructor initializes the contract, sets the owner, specifies the top-level domain
  constructor(string memory _tld) ERC721 ("CryptoConnect Name Service", "CCNS") payable {
    owner = payable(msg.sender); //msg.sender is the wallet address of the person who called the function.
    tld = _tld;
    console.log("%s name service deployed", _tld);
  }

  function register(string calldata name) public payable {
    if (domains[name] != address(0)) revert AlreadyRegistered(); // Checks if domain name is already registered and reverts with AlreadyRegistered error
    if (!valid(name)) revert InvalidName(name); // Checks if the provided domain name meets the length criteria (between 3 and 10 characters). Reverts with an InvalidName error.

    uint256 _price = price(name); // Determines the price for registering the domain based on its length.
    require(msg.value >= _price, "Not enough Matic paid");  // Check if enough Matic was paid in the transaction
    
    string memory _name = string(abi.encodePacked(name, ".", tld)); // Combine the name passed into the function with the TLD
    
    string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo)); // Create the SVG for the NFT with the name
    
    uint256 newRecordId = _tokenIds.current();
    uint256 length = StringUtils.strlen(name);
    string memory strLen = Strings.toString(length);

    console.log("Registering %s.%s on the contract with tokenID %d", name, tld, newRecordId);

    // Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
    string memory json = Base64.encode(
        abi.encodePacked(
            '{'
                '"name": "', _name,'", '
                '"description": "A domain on the CryptoConnect Naming Service", '
                '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(finalSvg)), '", '
                '"length": "', strLen, '"'
            '}'
        )
    );

    string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json)); // Create Token URI
    console.log("\n--------------------------------------------------------");
    console.log("Final tokenURI", finalTokenUri);
    console.log("--------------------------------------------------------\n");

    _safeMint(msg.sender, newRecordId); //Mints a new NFT associated with the provided domain name
    _setTokenURI(newRecordId, finalTokenUri); // Associates the generated token URI (metadata) with the newly created NFT.
    domains[name] = msg.sender; // Updates the domain mapping with the sender's address

    names[newRecordId] = name; //Updates the names mapping with the domain name
    _tokenIds.increment();
  }

  // This function will give us the price of a domain based on length
  function price(string calldata name) public pure returns(uint) {
    uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
    } else if (len == 4) {
      return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
    } else {
      return 1 * 10**17;
    }
  }
  
  // This will give us the domain owners' address given the domain name
  function getAddress(string calldata name) public view returns (address) {
    return domains[name];
  }

  // This sets a record for a domain.
  function setRecord(string calldata name, string calldata record) public {
    if (msg.sender != domains[name]) revert Unauthorized(); // Check that the owner is the transaction sender. Revert Unauthorized error
    records[name] = record;
  }

  // This retrieves the record associated with a particular domain.
  function getRecord(string calldata name) public view returns(string memory) {
    return records[name];
  }

  // This ensures that only the owner (who deployed the contract) can execute certain functions.
  modifier onlyOwner() {
  require(isOwner());
  _; }

  // This checks if the caller of the function is the owner of the contract.
  function isOwner() public view returns (bool) {
    return msg.sender == owner;
  }

  // This allows the owner to withdraw the balance of the contract. Only the owner can execute this function.
  function withdraw() public onlyOwner {
    uint amount = address(this).balance;
    
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Failed to withdraw Matic");
  }

  // This retrieves all the names stored in the contract and logs them
  function getAllNames() public view returns (string[] memory) {
    console.log("Getting all names from contract");
    string[] memory allNames = new string[](_tokenIds.current());
    for (uint i = 0; i < _tokenIds.current(); i++) {
      allNames[i] = names[i];
      console.log("Name for token %d is %s", i, allNames[i]);
    }

    return allNames;
  }

  // This checks if a given domain name is of valid length (between 3 and 10 characters).
  function valid(string calldata name) public pure returns(bool) {
    return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 10;
  }

  error Unauthorized();
  error AlreadyRegistered();
  error InvalidName(string name);
}