import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

interface BlockedCommand {
  pattern: RegExp;
  reason: string;
}

const BLOCKED_COMMANDS: BlockedCommand[] = [
  { pattern: /^git\s+push\b/, reason: "git push is blocked" },
  { pattern: /^git\s+tag\s+(-d|--delete)/, reason: "Deleting tags is blocked" },
  { pattern: /^git\s+reset\s+--hard/, reason: "git reset --hard is blocked" },
];

export function isBlockedCommand(command: string): string | null {
  const blocked = BLOCKED_COMMANDS.find(({ pattern }) => pattern.test(command));
  return blocked?.reason ?? null;
}

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (!isToolCallEventType("bash", event)) return;

    const command = event.input.command;
    const reason = isBlockedCommand(command);

    if (reason) {
      if (ctx.hasUI) {
        ctx.ui.notify(`Blocked: ${reason}`, "warning");
      }

      return { block: true, reason };
    }
  });
}
