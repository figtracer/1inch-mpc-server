# 1Inch MCP Server to get price feeds

This is a Model Context Protocol (MCP) server implementation for interacting with the 1Inch API. It provides a standardized interface for AI models to interact with the Blockscout API.

## Features

-  Get spot prices for common ETH tokens (USDC, WETH, USDT, DAI) on Ethereum mainnet


## Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 1inch-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Install globally:
```bash
npm install -g .
```

This global installation makes the `1inch-mcp` command available system-wide, which is required for Cursor, Cluade to find and execute the MCP server.

## Configuration

The server uses the following environment variable:

ONEINCH_API_KEY=<YOUR_API_KEY_1INCH>

### Cursor, claude MCP Configuration

Add the following to your `mcp.json` file in your Cursor (Settings > MCP > Add New Global Server):

```json
{
  "mcpServers": {
    "1inch-mpc-server": {
      "command": "npx",
      "args": ["-y", "1inch-mcp"],
      "env": {
        "ONEINCH_API_KEY"="<YOUR_API_KEY_1INCH>"
      }
    }
  } 
}
```

This configuration will make the following tools available in Cursor: (more to come, this is just a MVP project)

- `1inch Spot Price API` 
