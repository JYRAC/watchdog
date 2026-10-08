const WATCHDOG_TARGETS = [
  { repo: "vikunja", workflow: "watchdog.yml" },
  { repo: "casdoor", workflow: "watchdog.yml" },
  { repo: "directus", workflow: "watchdog.yml" },
  { repo: "rclone", workflow: "watchdog.yml" },
  { repo: "openbao", workflow: "watchdog.yml" },
];

const ROTATION_TARGETS = [
  { repo: "rclone", workflow: "rotate-secrets.yml" },
];

const BACKUP_TARGETS = [
  { repo: "backup", workflow: "backup.yml" },
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
    let targets;
    switch (event.cron) {
      case "0 0 * * 1":
        targets = ROTATION_TARGETS;
        break;
      case "0 18 * * *":
        targets = BACKUP_TARGETS;
        break;
      default:
        targets = WATCHDOG_TARGETS;
    }
    for (const t of targets) await dispatch(env, t.repo, t.workflow);
  },
};
