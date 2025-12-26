---
description: Create a commit for changes
argument-hint: [message]
---

# Commit Changes

## Git Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>: <short description>
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

Based on the above changes, create a single git commit while following the convention. $ARGUMENTS
