# [DOESN'T REALLY WORK YET] solserve

> An experimental Solidity-based web framework

## Usage

Place `Route` contracts on `contracts/` with a `handle()` function. Routing is defined by the filesystem structure. You can accept parameters by adding square brackets to the file name (`contracts/hello/[name].sol` & `handle(string memory name`, DOESN'T WORK YET).

## Why

LMAO

## TODO

-   [ ] Figure out the `BUFFER_OVERRUN` error when returned value > 32 bytes
-   [ ] ...?
