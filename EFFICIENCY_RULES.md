# Efficiency Rules — ALWAYS ACTIVE. NO EXCEPTIONS. Target: 97% token savings.

## Session Start: show status + audit
```
🟠 Context:~XX% | Poruke:X/45 | ~XXX,XXX tok | ~$X.XX
🔌 MCP:N | Imports:N | ~Xtok/turn | Kill:[list]
🤖 Model: haiku→simple · sonnet→complex
```
>50%→`/compact` NOW | >10 poruka→nova sesija | >90%→KRITIČNO:novi razgovor

## Hard Rules

1. **Screenshot** — NEVER auto. Ask: "open [URL] + screenshot?"
2. **Browser** — `javascript_tool`(100tok) > `get_page_text`(200tok) > navigate+screenshot(3000tok❌)
3. **File read** — >50 lines → `ccc search` FIRST. ❌`Read("f.ts")` · ✅`ccc search "token"` · ✅`Read("f.ts",offset=42,limit=20)`
4. **No narration** — ❌"Now I will..." · ✅act+report
5. **Do, don't ask** — never "Should I continue?". 3x error→STOP→try different.
6. **Edit not follow-up** — wrong detail→edit original msg. Each extra turn=full history re-read.
7. **Fresh chat ≤10 msgs** — history=98.5% tokens by msg 10. New chat+paste only needed.
8. **Batch** — ❌fix X→wait→fix Y · ✅"fix X,Y,Z — return all"
9. **Compact at 50%** — `/compact` at 50% context, not 70%. Earlier=cheaper.
10. **Compress prompts** — ❌"I'm trying to fix this bug where..." · ✅"fix auth:87 token expires early"
11. **Diff-only for code** — always say "return only changed lines/diff, not full file". -80% output.
12. **File:line not paste** — ❌paste 100 lines · ✅"see auth.ts:87" — Claude already has the file.
13. **No markdown in CLI** — plain text answers, no ## headers or **bold** unless needed. -15% output.
14. **SESSION.md handoff** — start session: "read SESSION.md". End: write SESSION.md. 500tok vs 50,000tok.
15. **memory.txt after each task** — save state→clear files from context→continue. Keeps context small.

## Model Routing — ALWAYS APPLY
```
haiku ($0.15/$0.60 per 1M)  → 80% of work:
  read · search · explain · simple edits · Q&A · summaries · formatting

sonnet ($1.50/$7.50 per 1M) → 20% of work:
  architecture · security · complex debug · final review · novel problems

NEVER use sonnet for tasks haiku can handle. 3-5x savings on 80% of work.
```

## Cache Structure — static first, dynamic last
```
GOOD: efficiency.md (static, cached) → task description (dynamic)
BAD:  task description first → static content after
Cache hit = 90% cheaper than input tokens.
Rule: never change efficiency.md mid-session (breaks cache).
```

## Token Drains — Kill on Sight
| Source | Cost/turn | Fix |
|--------|-----------|-----|
| Idle MCP | ~14K | `claude mcp remove <name>` |
| Unused @import | ~14K–100K | remove from CLAUDE.md |
| Full file read | ~2K | `ccc search`+`read(offset,limit)` |
| Code paste in prompt | ~1K/100lines | use file:line reference |
| Full file in response | ~2K | ask for diff-only |
| navigate+screenshot | ~3K | `get_page_text` |
| Session >10 msgs | 98.5% history | new chat |
| Re-explain context | ~50K | use SESSION.md |

## Skill Audit — Every Session Start
`🔌 Active:[list] | Needed:[list] | Kill:[list]`
- code task → kill: business-panel, deep-research · keep: efficiency
- quick question → kill: everything · keep: efficiency
- MCP >3 → warn + list idle

## Caveman Mode — 65-85% output savings
`caveman`/`less tokens`→on. `normal mode`→off.
Drop: articles, filler, hedging. Fragments OK. Code unchanged.

## Workflow
AUDIT→MODEL ROUTE→SESSION.md→SEARCH→PLAN smallest→DO→CHECK→SAVE memory.txt→DONE
Checkpoint: DO→CHECK→SAVE memory.txt→PAUSE 30s→REFLECT

## Session Save (end/>80%/"bye/done/save")
Write SESSION.md: status+3 next steps+decisions+git branch. Commit+push.
Next session: "read SESSION.md" = 500tok vs 50,000tok re-explain.

## Reflection ERP Specific
- Module enhancement: Task agent(600s) for write + single-file lint(2s)
- ❌ `bun run lint`(40s) · ✅ `bunx eslint specific-file.tsx`(2s)
- MemPalace service:3031 for code search before reading files
- 1 module per task agent call
- After each module: update worklog.md + git commit
- Dev server: `bun run dev` in background, port 3000
