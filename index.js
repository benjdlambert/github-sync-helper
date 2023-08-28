#!/usr/bin/env node
const { Octokit } = require('@octokit/rest');
const Luxon = require('luxon');
const { Command } = require('commander');
const program = new Command();
const open = require('open');
program.version('0.0.1');

const client = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_TOKEN,
});

program
  .command('issues')
  .option('-d, --days <days>', 'amount of days previous', 3)
  .option('-s, --since <20210429T14:00>', '')
  .option('-l, --labels <comma separated list of labels>', '')
  .option('--include-prs', 'include pull requests', false)
  .action(async ({ days, since, labels }) => {
    let timestamp;
    if (since) {
      timestamp = Luxon.DateTime.fromISO(since).toISO();
    } else {
      const date = Luxon.DateTime.local();
      timestamp = date.minus({ days }).toISO();
    }

    const issues = await client.paginate(client.issues.listForRepo, {
      owner: 'backstage',
      repo: 'backstage',
      since: timestamp,
      ...(labels ? { labels } : {}),
      per_page: 100,
    });

    for (const issue of issues) {
      if (issue.pull_request) {
        if (
          issue.labels.find(
            ({ name }) => name === 'needs discussion' || showPrs,
          )
        ) {
          open(issue.html_url);
        }
      } else {
        open(issue.html_url);
      }
    }
  });

program.parse(process.argv);
