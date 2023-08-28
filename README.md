# `github-sync-helper`

Here's a little script that helps with OSS syncs with Backstage.

You can use this to open up all issues and PR's that have been updated or created since the last sync.

`npx github-sync-helper@latest issues --days 3` will open up all issues that have been updated or created in the last 3 days.

`npx github-sync-helper@latest issues --labels area:catalog --days 7 --include-prs` will open up all issues and PR's that have the label `area:catalog` in the last 7 days.
