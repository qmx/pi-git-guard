# @qmxme/pi-git-guard

Blocks destructive git operations in [pi](https://github.com/badlogic/pi) to prevent accidental pushes, tag deletions, or hard resets.

## Blocked Operations

The following git commands are **unconditionally blocked**:

| Command | Reason |
|---------|--------|
| `git push` (any form) | Publishing is controlled manually |
| `git tag -d` / `git tag --delete` | Prevents accidental tag deletion |
| `git reset --hard` | Prevents discarding uncommitted changes |

## Examples

**Blocked:**
```bash
git push                          # ❌ Blocked
git push origin main              # ❌ Blocked
git push --force                  # ❌ Blocked
git tag -d v1.0                   # ❌ Blocked
git tag --delete old-tag          # ❌ Blocked
git reset --hard                  # ❌ Blocked
git reset --hard HEAD~1           # ❌ Blocked
```

**Allowed:**
```bash
git status                        # ✅ Allowed
git push --dry-run                # ❌ Still blocked (all push blocked)
git pull                          # ✅ Allowed
git fetch                         # ✅ Allowed
git reset --soft HEAD             # ✅ Allowed
git reset --mixed HEAD            # ✅ Allowed
git tag v1.0                      # ✅ Allowed (tag creation)
```

## Installation

Install globally:
```bash
pi install npm:@qmxme/pi-git-guard
```

Install project-local:
```bash
pi install npm:@qmxme/pi-git-guard -l
```

Try without installing:
```bash
pi -e npm:@qmxme/pi-git-guard
```

## How It Works

When pi attempts to execute a blocked git command:
1. The command is intercepted before execution
2. A warning notification is shown (if in interactive mode)
3. The command is blocked with a clear reason

The LLM will see the block reason in the tool result and can adjust its approach.

## Development

```bash
npm install      # Install dependencies
npm test         # Run tests
npm run typecheck # Type check
```

## License

MIT
