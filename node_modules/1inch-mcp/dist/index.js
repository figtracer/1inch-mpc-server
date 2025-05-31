#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { GetCommonEthPricesSchema } from './zodSchemas.js';
dotenv.config();
// Create server instance
const server = new Server({
    name: 'oneinch-price-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_common_eth_prices',
                description: 'Get spot prices for common ETH tokens (USDC, WETH, USDT, DAI) on Ethereum mainnet',
                inputSchema: zodToJsonSchema(GetCommonEthPricesSchema),
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params?.name) {
            throw new Error('Missing tool name');
        }
        if (!request.params.arguments) {
            throw new Error('Missing arguments');
        }
        const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
        if (!ONEINCH_API_KEY) {
            throw new Error('ONEINCH_API_KEY is not set');
        }
        let endpoint = '';
        let queryParams = new URLSearchParams();
        switch (request.params.name) {
            case 'get_common_eth_prices': {
                const { currency } = request.params.arguments;
                const commonAddresses = [
                    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
                    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
                    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
                    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
                ];
                const addressesParam = commonAddresses.join(',');
                endpoint = `/price/v1.1/1/${addressesParam}`;
                if (currency)
                    queryParams.append('currency', currency);
                break;
            }
            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
        // Build final URL
        const baseUrl = 'https://api.1inch.dev';
        const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, baseUrl);
        url.search = queryParams.toString();
        // Execute HTTP call
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${ONEINCH_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        const data = await response.json();
        // Return raw JSON; optionally perform formatting here
        return { result: JSON.stringify(data, null, 2) };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        throw error;
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('1inch MCP Server running on stdio');
}
runServer().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
