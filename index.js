#!/usr/bin/env node
const { Octokit } = require("@octokit/rest");
const Luxon = require("luxon");
const { Command } = require("commander");
const program = new Command();
const open = require("open");
program.version("0.0.1");

const client = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

program
  .command("issues")
  .option("-d, --days <days>", "amount of days previous", 3)
  .option('--ignore-stale', 'ignore stale')
  .action(async ({ days, ignoreStale }) => {
    const date = Luxon.DateTime.local();
    const since = date.minus({ days }).toISO();

    const issues = await client.paginate(client.issues.listForRepo, {
      owner: "spotify",
      repo: "backstage",
      since,
      per_page: 200,
    });
  
    const issuesToOpen = issues.filter((i) => {
      if (ignoreStale) {
        return !i.labels.some(l => l.name === 'stale')
      }
      return true;
    })

    console.log(issuesToOpen[issuesToOpen.length - 1].labels);
    const issueUrls = issuesToOpen.map(({ html_url }) => html_url);

    // issueUrls.forEach((u) => open(u));
  });

program.parse(process.argv);
