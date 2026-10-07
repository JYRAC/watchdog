const WATCHDOG_TARGETS = [
  { repo: "vikunja", workflow: "watchdog.yml" },
  { repo: "casdoor", workflow: "watchdog.yml" },
  { repo: "directus", workflow: "watchdog.yml" },
  { repo: "rclone", workflow: "watchdog.yml" },
];

const ROTATION_TARGETS = [
  { repo: "rclone", workflow: "rotate-secrets.yml" },
];

async function dispatch(env, repo, workflow) {
  const resp = await fetch(
    `https://api.github.com/repos/JYRAC/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GITHUB_PAT}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "cf-worker-watchdog-trigger",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );
  if (!resp.ok) {
    console.error(`${repo}/${workflow}: trigger failed ${resp.status} ${await resp.text()}`);
  }
}

export default {
  async scheduled(event, env, ctx) {
    if (event.cron === "0 0 * * 1") {
      // 週次: ローテーション
      for (const t of ROTATION_TARGETS) await dispatch(env, t.repo, t.workflow);
    } else {
      // それ以外(頻繁): watchdog
      for (const t of WATCHDOG_TARGETS) await dispatch(env, t.repo, t.workflow);
    }
  },
};
