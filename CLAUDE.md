# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a collection of development tools and utilities, including:

- **Voice Assistant Components**: Previously contained Python scripts for voice interaction using OpenAI API, Whisper API, and Elevenlabs for voice synthesis (files were recently deleted but git history contains `luna_*.py` files)
- **GitHub Repository Management**: Batch scripts for creating and updating GitHub repositories
- **Development Environment**: WSL-based development setup with Claude Code integration
- **Web Checkers Game**: Local HTTP server setup for running a 3D checkers game

## Key Components

### GitHub Management Scripts
- `deploy to github - public.bat` / `deploy to github - private.bat`: Creates new GitHub repositories with timestamped names
- `update to github.bat`: Updates existing GitHub repositories by cloning, copying files, and pushing changes
- Both scripts handle authentication via personal access tokens and include comprehensive error handling

### Development Environment
- `claude coder starter.bat`: Launches Claude Code in WSL Ubuntu environment
- `reset_wsl.bat`: WSL reset utility
- `mcp_config.json`: MCP (Model Context Protocol) configuration with Zapier Actions integration

### Web Application
- `run_web_checkers.bat`: Starts local HTTP server on port 8000 and opens 3D checkers game in browser

## Development Workflow

### Running the Web Checkers Game
```bash
# Windows
run_web_checkers.bat
# Or manually:
python -m http.server 8000
```

### GitHub Operations
- Use the deployment scripts to create new repositories with automatic timestamping
- Use the update script for syncing local changes to existing GitHub repositories
- Scripts automatically handle Git operations (init, add, commit, push)

### Claude Code Integration
- Use `claude coder starter.bat` to launch Claude Code in the WSL environment
- MCP integration is configured for Zapier Actions

## Project History

This repository previously contained a voice assistant application using:
- OpenAI API for conversation
- Whisper API for speech-to-text
- Elevenlabs for text-to-speech synthesis
- Gradio for web interface
- Various model configurations and implementations

The Python components have been removed but are preserved in git history (commit f4dcd1c).

## Environment Requirements

- WSL with Ubuntu
- Python 3.x (for HTTP server and any restored Python components)
- Git and cURL (for GitHub operations)
- Claude Code installed in WSL environment