#!/usr/bin/env node
/**
 * DevContext MCP Server
 *
 * Exposes DevContext functionality as MCP tools and resources
 * for Claude Code and other MCP-compatible clients.
 *
 * Usage:
 *   devctx-mcp                    # stdio transport (default)
 *
 * Configure in Claude Code's MCP settings:
 *   {
 *     "mcpServers": {
 *       "devctx": {
 *         "command": "devctx-mcp"
 *       }
 *     }
 *   }
 */
export {};
