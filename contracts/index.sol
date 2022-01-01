// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

contract Route {
	uint256 internal counter = 0;

	constructor() {}

	function handle() public returns (uint256) {
		counter += 1;

		return counter;
	}
}
