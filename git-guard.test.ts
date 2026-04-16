import { describe, it, expect } from "vitest";
import { isBlockedCommand } from "./git-guard";

describe("git-guard", () => {
  describe("blocked commands", () => {
    describe("git push", () => {
      it("blocks basic git push", () => {
        expect(isBlockedCommand("git push")).toBe("git push is blocked");
      });

      it("blocks git push with remote and branch", () => {
        expect(isBlockedCommand("git push origin main")).toBe("git push is blocked");
        expect(isBlockedCommand("git push upstream develop")).toBe("git push is blocked");
      });

      it("blocks git push with flags", () => {
        expect(isBlockedCommand("git push --force")).toBe("git push is blocked");
        expect(isBlockedCommand("git push --dry-run")).toBe("git push is blocked");
        expect(isBlockedCommand("git push --set-upstream origin main")).toBe("git push is blocked");
      });

      it("blocks git push with multiple spaces", () => {
        expect(isBlockedCommand("git  push")).toBe("git push is blocked");
        expect(isBlockedCommand("git   push   origin   main")).toBe("git push is blocked");
      });

      it("blocks git push with leading commands (cd && ...)", () => {
        expect(isBlockedCommand("cd /some/path && git push origin main")).toBe("git push is blocked");
        expect(isBlockedCommand("cd /path && git push --force")).toBe("git push is blocked");
      });

      it("blocks git push with git -C flag", () => {
        expect(isBlockedCommand("git -C /tmp/foo push")).toBe("git push is blocked");
        expect(isBlockedCommand("git -C /some/path push origin main")).toBe("git push is blocked");
      });
    });

    describe("git tag -d", () => {
      it("blocks git tag -d", () => {
        expect(isBlockedCommand("git tag -d v1.0")).toBe("Deleting tags is blocked");
        expect(isBlockedCommand("git tag -d mytag")).toBe("Deleting tags is blocked");
      });

      it("blocks git tag --delete", () => {
        expect(isBlockedCommand("git tag --delete v1.0")).toBe("Deleting tags is blocked");
        expect(isBlockedCommand("git tag --delete old-tag")).toBe("Deleting tags is blocked");
      });

      it("blocks git tag -d with multiple tags", () => {
        expect(isBlockedCommand("git tag -d v1.0 v2.0 v3.0")).toBe("Deleting tags is blocked");
      });

      it("blocks git tag -d with leading commands", () => {
        expect(isBlockedCommand("cd /path && git tag -d v1.0")).toBe("Deleting tags is blocked");
        expect(isBlockedCommand("cd /path && git tag --delete mytag")).toBe("Deleting tags is blocked");
      });

      it("blocks git tag -d with git -C flag", () => {
        expect(isBlockedCommand("git -C /tmp/foo tag -d v1.0")).toBe("Deleting tags is blocked");
        expect(isBlockedCommand("git -C /some/path tag --delete mytag")).toBe("Deleting tags is blocked");
      });
    });

    describe("git reset --hard", () => {
      it("blocks git reset --hard", () => {
        expect(isBlockedCommand("git reset --hard")).toBe("git reset --hard is blocked");
      });

      it("blocks git reset --hard with commit", () => {
        expect(isBlockedCommand("git reset --hard HEAD")).toBe("git reset --hard is blocked");
        expect(isBlockedCommand("git reset --hard HEAD~1")).toBe("git reset --hard is blocked");
        expect(isBlockedCommand("git reset --hard abc123")).toBe("git reset --hard is blocked");
      });

      it("blocks git reset --hard with multiple spaces", () => {
        expect(isBlockedCommand("git  reset  --hard")).toBe("git reset --hard is blocked");
      });

      it("blocks git reset --hard with leading commands (cd && ...)", () => {
        expect(isBlockedCommand("cd /home/qmx/.config/nix && git reset --hard HEAD~1")).toBe("git reset --hard is blocked");
        expect(isBlockedCommand("cd /some/path && git reset --hard")).toBe("git reset --hard is blocked");
        expect(isBlockedCommand("cd /path && git  reset  --hard HEAD~1")).toBe("git reset --hard is blocked");
      });

      it("blocks git reset --hard with subshell", () => {
        expect(isBlockedCommand("(cd /tmp && git reset --hard)")).toBe("git reset --hard is blocked");
      });

      it("blocks git reset --hard with git -C flag", () => {
        expect(isBlockedCommand("git -C /tmp/foo reset --hard")).toBe("git reset --hard is blocked");
        expect(isBlockedCommand("git -C /tmp/foo reset --hard HEAD~1")).toBe("git reset --hard is blocked");
        expect(isBlockedCommand("git -C /some/path  reset  --hard")).toBe("git reset --hard is blocked");
      });
    });
  });

  describe("allowed commands", () => {
    it("allows git status", () => {
      expect(isBlockedCommand("git status")).toBe(null);
      expect(isBlockedCommand("git status -s")).toBe(null);
    });

    it("allows git log", () => {
      expect(isBlockedCommand("git log")).toBe(null);
      expect(isBlockedCommand("git log --oneline")).toBe(null);
    });

    it("allows git add", () => {
      expect(isBlockedCommand("git add .")).toBe(null);
      expect(isBlockedCommand("git add file.ts")).toBe(null);
    });

    it("allows git commit", () => {
      expect(isBlockedCommand("git commit -m 'message'")).toBe(null);
      expect(isBlockedCommand("git commit --amend")).toBe(null);
    });

    it("allows git branch", () => {
      expect(isBlockedCommand("git branch")).toBe(null);
      expect(isBlockedCommand("git branch -a")).toBe(null);
      expect(isBlockedCommand("git branch new-feature")).toBe(null);
    });

    it("allows git checkout", () => {
      expect(isBlockedCommand("git checkout main")).toBe(null);
      expect(isBlockedCommand("git checkout -b new-branch")).toBe(null);
    });

    it("allows git fetch", () => {
      expect(isBlockedCommand("git fetch")).toBe(null);
      expect(isBlockedCommand("git fetch origin")).toBe(null);
    });

    it("allows git pull", () => {
      expect(isBlockedCommand("git pull")).toBe(null);
      expect(isBlockedCommand("git pull origin main")).toBe(null);
    });

    it("allows git reset --soft", () => {
      expect(isBlockedCommand("git reset --soft HEAD")).toBe(null);
      expect(isBlockedCommand("git reset --soft HEAD~1")).toBe(null);
    });

    it("allows git reset --mixed", () => {
      expect(isBlockedCommand("git reset --mixed HEAD")).toBe(null);
    });

    it("allows git tag creation", () => {
      expect(isBlockedCommand("git tag v1.0")).toBe(null);
      expect(isBlockedCommand("git tag -a v1.0 -m 'release'")).toBe(null);
    });

    it("allows other git commands", () => {
      expect(isBlockedCommand("git diff")).toBe(null);
      expect(isBlockedCommand("git show")).toBe(null);
      expect(isBlockedCommand("git stash")).toBe(null);
      expect(isBlockedCommand("git merge")).toBe(null);
    });
  });

  describe("edge cases", () => {
    it("handles empty command", () => {
      expect(isBlockedCommand("")).toBe(null);
    });

    it("handles non-git commands", () => {
      expect(isBlockedCommand("ls")).toBe(null);
      expect(isBlockedCommand("npm install")).toBe(null);
    });

    it("blocks git commands with leading whitespace", () => {
      // Now catches leading whitespace due to word boundary
      expect(isBlockedCommand("  git push")).toBe("git push is blocked");
      expect(isBlockedCommand("  git reset --hard")).toBe("git reset --hard is blocked");
    });

    it("blocks git commands in different context (strings)", () => {
      // Word boundary matches inside strings - this is intentional for safety
      expect(isBlockedCommand("echo 'git push'")).toBe("git push is blocked");
      expect(isBlockedCommand("grep 'git push' file.txt")).toBe("git push is blocked");
      expect(isBlockedCommand("echo 'git reset --hard'")).toBe("git reset --hard is blocked");
    });
  });
});
