# Development Environment Setup Guide

Complete step-by-step guide to replicate the agentic development environment.

---

## Prerequisites

### Required Tools (install via Homebrew)

```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Core CLI tools
brew install git           # Version control
brew install gh            # GitHub CLI
brew install atuin         # Shell history sync
brew install fzf           # Fuzzy finder
brew install ripgrep       # Fast grep (rg)
brew install fd            # Fast find
brew install eza           # Modern ls
brew install bat           # Cat with syntax highlighting
brew install jq            # JSON processor

# Terminal & Shell
brew install tmux          # Terminal multiplexer
brew install tmuxinator    # Tmux session manager
brew install starship      # Cross-shell prompt
brew install neovim        # Terminal editor

# AI Coding Agents
brew install --cask claude-code   # Claude Code CLI
brew install --cask wezterm       # Terminal emulator

# Runtime environments
brew install bun           # Fast JS runtime (for hooks)
brew install node          # Node.js
brew install python3       # Python 3
```

### One-Liner for All Brew Packages

```bash
brew install git gh atuin fzf ripgrep fd eza bat jq tmux tmuxinator starship neovim bun node python3 && brew install --cask claude-code wezterm
```

### Additional Tools (npm/manual)

```bash
# BMAD Method v6 (pre-release) - REQUIRED
npm install -g bmad-method@6.0.0-alpha.22

# Gemini CLI
npm install -g @google/gemini-cli

# Codex CLI
npm install -g @openai/codex-cli

# CASS Memory (if using)
npm install -g cass-memory
```

---

## Step 1: Clone Repositories

```bash
# Create dev directory
mkdir -p ~/dev

# Clone dotfiles (shell, terminal, git configs)
git clone git@github.com:ali-nr/dotfiles.git ~/dev/dotfiles

# Clone AI agent configs (directly to home directories)
git clone git@github.com:ali-nr/claude-config.git ~/.claude
git clone git@github.com:ali-nr/gemini-config.git ~/.gemini
git clone git@github.com:ali-nr/codex-config.git ~/.codex
```

---

## Step 2: Replace Username Placeholders

**IMPORTANT**: The config files contain `<USERNAME>` placeholders that MUST be replaced with your actual username.

```bash
# Get your username
echo "Your username is: $(whoami)"

# Replace placeholder in ALL config files
sed -i '' "s/<USERNAME>/$(whoami)/g" ~/.claude/settings.json
sed -i '' "s/<USERNAME>/$(whoami)/g" ~/.gemini/settings.json
sed -i '' "s/<USERNAME>/$(whoami)/g" ~/.codex/config.toml
```

### Verify Replacements

```bash
# Should show your actual username, NOT <USERNAME>
grep -r "USERNAME" ~/.claude/settings.json ~/.gemini/settings.json ~/.codex/config.toml
# If no output, placeholders are correctly replaced
```

---

## Step 3: Run Dotfiles Installer

```bash
cd ~/dev/dotfiles
chmod +x install.sh
./install.sh
```

This creates symlinks for:
- `~/.zshrc` - ZSH configuration
- `~/.aliases.zsh` - Shell aliases
- `~/.zprofile` - ZSH profile
- `~/.gitconfig` - Git configuration
- `~/.gitignore` - Global gitignore
- `~/.tmux.conf` - Tmux configuration
- `~/.config/tmuxinator/` - Tmuxinator templates
- `~/.wezterm.lua` - WezTerm configuration
- `~/.config/wezterm/` - WezTerm modules
- `~/.config/starship.toml` - Starship prompt

---

## Step 4: Configure Claude Code

### Install Hook Dependencies

```bash
cd ~/.claude/hooks
bun install
```

### Link MCP Configuration

```bash
ln -sf ~/.claude/.mcp.json ~/.mcp.json
```

### Build CCometixLine (Status Line) - Optional

If you want the custom status line:

```bash
# Install Rust if not present
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Clone and build CCometixLine
git clone https://github.com/cometix/CCometixLine.git ~/.claude/CCometixLine
cd ~/.claude/CCometixLine
cargo build --release
mkdir -p ~/.claude/ccline
cp target/release/ccline ~/.claude/ccline/ccline
```

---

## Step 5: Configure Gemini CLI

Authenticate with Google:

```bash
gemini auth login
```

---

## Step 6: Configure Codex CLI

Authenticate with OpenAI:

```bash
codex auth
```

---

## Step 7: Install BMAD Extensions

```bash
# Install BMAD globally (already done in prerequisites)
npm install -g bmad-method@6.0.0-alpha.22

# Initialize BMAD in a project (optional)
bmad init
```

---

## Step 8: Verify Installation

### Check Symlinks

```bash
ls -la ~/.zshrc ~/.tmux.conf ~/.wezterm.lua ~/.mcp.json
ls -la ~/.config/tmuxinator ~/.config/wezterm
```

### Check AI Agents

```bash
claude --version
gemini --version
codex --version
bmad --version
```

### Test Tmuxinator

```bash
# Start multi-agent team layout
mux team ~/dev/dotfiles
```

This opens a 3-pane layout:
```
┌─────────────────────────────────────┐
│           Claude (Lead)             │
├──────────────────┬──────────────────┤
│      Gemini      │      Codex       │
└──────────────────┴──────────────────┘
```

---

## Quick Reference

### Repositories

| Repo | URL | Location |
|------|-----|----------|
| dotfiles | github.com/ali-nr/dotfiles | `~/dev/dotfiles` |
| claude-config | github.com/ali-nr/claude-config | `~/.claude` |
| gemini-config | github.com/ali-nr/gemini-config | `~/.gemini` |
| codex-config | github.com/ali-nr/codex-config | `~/.codex` |

### Key Aliases

| Alias | Command |
|-------|---------|
| `mux` | `tmuxinator` |
| `mux team` | Start multi-agent tmux layout |
| `cc` | Claude Code |
| `gc` | Gemini CLI |
| `cx` | Codex CLI |

### Files with `<USERNAME>` Placeholder

These files require the placeholder to be replaced:

| File | What it configures |
|------|-------------------|
| `~/.claude/settings.json` | Claude hooks and status line paths |
| `~/.gemini/settings.json` | Gemini context directories |
| `~/.codex/config.toml` | Codex trusted project paths |

---

## Troubleshooting

### Hooks not working

1. Ensure bun is installed: `bun --version`
2. Run `cd ~/.claude/hooks && bun install`
3. Verify username is replaced: `cat ~/.claude/settings.json | grep -v USERNAME`

### Tmuxinator not found

```bash
brew install tmuxinator
```

### Permission denied on install.sh

```bash
chmod +x ~/dev/dotfiles/install.sh
```

### `<USERNAME>` still in config files

```bash
# Re-run the replacement
sed -i '' "s/<USERNAME>/$(whoami)/g" ~/.claude/settings.json
sed -i '' "s/<USERNAME>/$(whoami)/g" ~/.gemini/settings.json
sed -i '' "s/<USERNAME>/$(whoami)/g" ~/.codex/config.toml
```

---

## Without Sudo Access

All tools can be installed without admin access:

| Tool | User-local Install |
|------|-------------------|
| **Homebrew** | Installs to `~/.homebrew` on macOS |
| **Bun** | `curl -fsSL https://bun.sh/install \| bash` |
| **Node** | Use `nvm` or `fnm` for user-local installs |
| **Rust** | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Dotfiles** | Only creates symlinks in `$HOME`, no sudo needed |
