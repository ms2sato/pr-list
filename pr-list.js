#!/usr/bin/env node

// [usage] GITHUB_ACCESS_TOKEN=your_github_access_token GITHUB_USERNAME=your_username node pr-list.js

// GitHubのアクセストークンを環境変数から取得
const accessToken = process.env.GITHUB_ACCESS_TOKEN;
if (!accessToken) {
  console.error("GitHub Access Token is not provided.");
  process.exit(1);
}

// ユーザー名を環境変数から取得
const username = process.env.GITHUB_USERNAME;
if (!username) {
  console.error("GitHub Username is not provided.");
  process.exit(1);
}

// 今日の日付を取得
const today = new Date();

// 1ヶ月前の日付を計算
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);

// GitHub APIのエンドポイントURL
const endpointUrl = `https://api.github.com/search/issues?q=is:pr+author:${username}+merged:>${oneMonthAgo.toISOString()}&sort=created&order=desc`;

// Authorizationヘッダーを設定
const headers = {
  Authorization: `Bearer ${accessToken}`,
};

// APIリクエストを送信
fetch(endpointUrl, { headers })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const pullRequests = data.items;
    displayMergedPullRequests(pullRequests);
  })
  .catch((error) => {
    console.error("Error fetching pull requests:", error);
  });

// Pull Requestの情報を表示する関数
function displayMergedPullRequests(pullRequests) {
  const mergedPullRequests = pullRequests.filter((pr) => pr.pull_request.merged_at);

  if (mergedPullRequests.length === 0) {
    console.log("No merged pull requests found.");
    return;
  }

  console.log(`Found ${mergedPullRequests.length} merged pull requests.`);
  const projects = {}

  mergedPullRequests.forEach((pr) => {
    // console.log(JSON.stringify(pr, null, 2));

    console.log(`Pull Request #${pr.number}: ${pr.title}`);
    console.log(`Created at: ${pr.created_at}`);
    console.log(`Merged at: ${pr.pull_request.merged_at}`);
    if (pr.repository_url) {
      console.log(`Repository: ${pr.repository_url}`);
      const count = projects[pr.repository_url]
      if(!count) {
        projects[pr.repository_url] = 1
      }
      else {
        projects[pr.repository_url] = count + 1
      }
    } else {
      console.log("Repository information not available");
    }
    console.log(`URL: ${pr.html_url}`);

    console.log("---");
  });

  console.log("Total")
  for(const [key, count] of Object.entries(projects)) {
    console.log(`${key}:\t${count}`)
  }
}
