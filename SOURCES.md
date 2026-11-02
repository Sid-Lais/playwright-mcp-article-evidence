# Sources used for the article

Third-party material the article cites. These were read, not reproduced or re-measured here.
Claims about `@playwright/mcp` itself (tool counts, token counts, flags, arguments, locators, visibility
assertions) are the ones tested in this repo; see the README.

## Reference video

| Source | Used for |
|---|---|
| [AI-Assisted Playwright Test Automation with MCP, Copilot & Claude Code](https://www.youtube.com/watch?v=-wt29usaPlc) (Testrig Technologies) | Webinar points on model drift, shared instructions files, and the healer looping on real app bugs |

## Cited in the article

| Source | Used for |
|---|---|
| [Anthropic: Model Context Protocol announcement](https://www.anthropic.com/news/model-context-protocol) | MCP announced November 2024 |
| [Playwright MCP introduction](https://playwright.dev/mcp/introduction) | Structured accessibility snapshots, no vision model needed |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Install command, tool list, flags, CLI-vs-MCP guidance |
| [Playwright MCP snapshots documentation](https://playwright.dev/mcp/snapshots) | Snapshot levers: `browser_find`, `target`, `depth`, `--snapshot-mode` |
| [Playwright release notes](https://playwright.dev/docs/release-notes) | Test Agents (planner, generator, healer) in 1.56 |
| [FicusRoot Claude Code lesson](https://www.youtube.com/watch?v=IkJSCmnVnAw) | Claude Code guessing locators without MCP; negative-amount transfer defect found by the planner |
| [Testomat.io: Playwright MCP with Claude Code](https://testomat.io/blog/playwright-mcp-claude-code/) | About seven minutes for one generated scenario |
| [Bondar Academy: Playwright AI agents review](https://bondaracademy.com/blog/playwright-ai-agents-review) | Healer fixing two failing tests in about 10 minutes; planner, generator and healer timings |
| [Bondar Academy: Is Playwright MCP worth it?](https://bondaracademy.com/blog/is-playwright-mcp-worth-it) | Duplicate Delete-button match, "Edit Article" targeted as a link, eight-step test needing five attempts |
| [ITNEXT: Why does Playwright MCP use so many tokens?](https://itnext.io/why-does-playwright-mcp-use-so-many-tokens-da56b6dbd2db) | Median input of 12.9k to 14.1k tokens per call across eight sites; 40-step cap on a 12-page form |
| [Currents: Playwright MCP](https://currents.dev/posts/playwright-mcp) | Issue #39955 (`toHaveText()` on hidden content); `--repeat-each=25` |
| [IT Brief: Stack Overflow survey on developer trust in AI](https://itbrief.co.uk/story/stack-overflow-survey-shows-developers-trust-ai-with-caveats) | 6.6% of developers trusting AI for important decisions |
