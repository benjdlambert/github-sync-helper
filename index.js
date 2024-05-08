#!/usr/bin/env node
const { Octokit } = require('@octokit/rest');
const Luxon = require('luxon');
const { Command } = require('commander');
const program = new Command();
const open = require('open');
const chalk = require('chalk');
program.version('0.0.1');

const client = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_TOKEN,
});

program
  .command('issues')
  .option('-d, --days <days>', 'amount of days previous', 3)
  .option('-s, --since <20210429T14:00>', '')
  .option('-l, --labels <comma separated list of labels>', '')
  .option('--repo <repo>', 'repo to search', 'backstage/backstage')
  .option('--include-prs', 'include pull requests', false)
  .action(async ({ days, since, labels, includePrs, repo: repoSlug }) => {
    let timestamp;
    if (since) {
      timestamp = Luxon.DateTime.fromISO(since).toISO();
    } else {
      const date = Luxon.DateTime.local();
      timestamp = date.minus({ days }).toISO();
    }

    console.log(chalk.yellow`Pulling issues since ${timestamp}`);
    console.log(chalk.yellow`Using repository: ${repoSlug}`);

    const [owner, repo] = repoSlug.split('/');
    const issues = await client.paginate(client.issues.listForRepo, {
      owner,
      repo,
      since: timestamp,
      ...(labels ? { labels } : {}),
      per_page: 100,
    });

    console.log(chalk.green`Found ${issues.length} issues`);

    for (const issue of issues) {
      if (issue.pull_request) {
        if (
          issue.labels.find(
            ({ name }) => name === 'needs discussion' || includePrs,
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
