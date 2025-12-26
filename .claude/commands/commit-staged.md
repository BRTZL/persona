---
description: Create a git commit for staged changes
---

# Git Commit Staged Changes

## Git Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>(<scope>): <short description>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `test` - Adding or fixing tests
- `chore` - Maintenance tasks

**Examples:**

- `feat: add course bookmark endpoint`
- `fix resolve video playback crash`
- `refactor: migrate db.query to SQL-like syntax`

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit. Commit message should be always one line. Before actually committing your changes ask user for approval with the comment message.
