// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Button {
    using SafeMath for uint256;

    event ButtonPress(address indexed _sender);
    event ClaimTreasure(address indexed _sender, uint _value);

    uint256 _end; //block number that is reset each button press
    address presser; //address of user who presses button

    //first check is block number plus 4 because deploying contract takes a transaction
    constructor() {
        _end = block.number + 4;
    }   

    //function called to receive fee and store address and reset 3 block timer

    function press_button () public payable {             
        require(msg.value == 1 ether, "incorrect fee");       
        presser = msg.sender;
        _end = block.number + 3; 
        emit ButtonPress(presser);
    }

    /*function to claim total ether in contract, checks that caller was last to send fee and press button and also 
    checks that 3 blocks have passed. then resets block timer and transfer contract balance. */ 

    function claim_treasure () public {
        require(presser == msg.sender, "not last presser");
        require(_end < block.number, "hasnt been 3 blocks");
        _end = block.number + 3;
        payable(msg.sender).transfer(address(this).balance);
        emit ClaimTreasure(msg.sender,address(this).balance);
    }

    //fallback function

    receive() external payable {
        press_button();
    }

}