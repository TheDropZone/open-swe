import { Octokit } from "@octokit/rest";
import { createLogger, LogLevel } from "../logger.js";
import {
  GitHubBranch as GitHubBranchResponse,
  GitHubIssue as GitHubIssueResponse,
  GitHubIssueComment as GitHubIssueCommentResponse,
  GitHubPullRequest as GitHubPullRequestResponse,
  GitHubPullRequestList,
} from "./types.js";
import { getOpenSWELabel } from "./label.js";
import { getInstallationToken } from "@open-swe/shared/github/auth";
import { getConfig } from "@langchain/langgraph";
import { GITHUB_INSTALLATION_ID } from "@open-swe/shared/constants";
import { updateConfig } from "../update-config.js";
import { encryptSecret } from "@open-swe/shared/crypto";
import { VCS, PullRequest, Issue, IssueComment, Branch } from "../vcs/types.js";

const logger = createLogger(LogLevel.INFO, "GitHub-API");

async function getInstallationTokenAndUpdateConfig() {
  // ... (implementation unchanged)
}

async function withGitHubRetry<T>(
  operation: (token: string) => Promise<T>,
  initialToken: string,
  errorMessage: string,
  additionalLogFields?: Record<string, any>,
  numRetries = 1,
): Promise<T | null> {
  // ... (implementation unchanged)
}

export async function updateIssue({
  owner,
  repo,
  issueNumber,
  githubInstallationToken,
  body,
  title,
  numRetries = 1,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
  githubInstallationToken: string;
  body?: string;
  title?: string;
  numRetries?: number;
}) {
  if (!body && !title) {
    throw new Error("Must provide either body or title to update issue");
  }

  return withGitHubRetry(
    async (token: string) => {
      const octokit = new Octokit({
        auth: token,
      });

      const { data: issue } = await octokit.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        ...(body && { body }),
        ...(title && { title }),
      });

      return issue;
    },
    githubInstallationToken,
    "Failed to update issue",
    undefined,
    numRetries,
  );
}

export async function updatePullRequest({
  owner,
  repo,
  pullNumber,
  title,
  body,
  githubInstallationToken,
}: {
  owner: string;
  repo: string;
  pullNumber: number;
  title?: string;
  body?: string;
  githubInstallationToken: string;
}) {
  return withGitHubRetry(
    async (token: string) => {
      const octokit = new Octokit({
        auth: token,
      });

      const { data: pullRequest } = await octokit.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        ...(title && { title }),
        ...(body && { body }),
      });

      return pullRequest;
    },
    githubInstallationToken,
    "Failed to update pull request",
    { pullNumber, owner, repo },
    1,
  );
}

export class GitHubVCS implements VCS {
  private githubInstallationToken: string;

  constructor(githubInstallationToken: string) {
    this.githubInstallationToken = githubInstallationToken;
  }

  async createPullRequest(options: {
    owner: string;
    repo: string;
    headBranch: string;
    title: string;
    body?: string;
    baseBranch?: string;
  }): Promise<PullRequest | null> {
    const pr = await createPullRequest({
      ...options,
      githubInstallationToken: this.githubInstallationToken,
    });
    if (!pr) {
      return null;
    }
    return {
      html_url: pr.html_url,
      number: pr.number,
    };
  }

  async getIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
  }): Promise<Issue | null> {
    const issue = await getIssue({
      ...options,
      githubInstallationToken: this.githubInstallationToken,
    });
    if (!issue) {
      return null;
    }
    return {
      title: issue.title,
      body: issue.body,
    };
  }

  async createIssueComment(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body: string;
  }): Promise<IssueComment | null> {
    const comment = await createIssueComment({
      ...options,
      githubToken: this.githubInstallationToken,
    });
    if (!comment) {
      return null;
    }
    return {
      body: comment.body,
    };
  }

  async getBranch(options: {
    owner: string;
    repo: string;
    branchName: string;
  }): Promise<Branch | null> {
    const branch = await getBranch({
      ...options,
      githubInstallationToken: this.githubInstallationToken,
    });
    if (!branch) {
      return null;
    }
    return {
      name: branch.name,
    };
  }

  async updatePullRequest(options: {
    owner: string;
    repo: string;
    pullNumber: number;
    title?: string;
    body?: string;
  }): Promise<PullRequest | null> {
    const pr = await updatePullRequest({
      ...options,
      githubInstallationToken: this.githubInstallationToken,
    });
    if (!pr) {
      return null;
    }
    return {
      html_url: pr.html_url,
      number: pr.number,
    };
  }
}

// Keep the original functions as they are used in other places in the codebase
// We will refactor those places later to use the VCS interface
// For now, we just create the new class and implement the interface
export async function getIssueComments({
  owner,
  repo,
  issueNumber,
  githubInstallationToken,
  filterBotComments,
  numRetries = 1,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
  githubInstallationToken: string;
  filterBotComments: boolean;
  numRetries?: number;
}): Promise<GitHubIssueCommentResponse[] | null> {
  return withGitHubRetry(
    async (token: string) => {
      const octokit = new Octokit({
        auth: token,
      });

      const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
      });

      if (!filterBotComments) {
        return comments;
      }

      return comments.filter(
        (comment) =>
          comment.user?.type !== "Bot" &&
          !comment.user?.login?.includes("[bot]"),
      );
    },
    githubInstallationToken,
    "Failed to get issue comments",
    undefined,
    numRetries,
  );
}

async function getExistingPullRequest(
  owner: string,
  repo: string,
  branchName: string,
  githubToken: string,
  numRetries = 1,
): Promise<GitHubPullRequestList[number] | null> {
  // ... (implementation unchanged)
}

export async function createPullRequest({
  owner,
  repo,
  headBranch,
  title,
  body = "",
  githubInstallationToken,
  baseBranch,
  draft = false,
  nullOnError = false,
}: {
  owner: string;
  repo: string;
  headBranch: string;
  title: string;
  body?: string;
  githubInstallationToken: string;
  baseBranch?: string;
  draft?: boolean;
  nullOnError?: boolean;
}): Promise<GitHubPullRequestResponse | GitHubPullRequestList[number] | null> {
  // ... (implementation unchanged)
}

export async function getIssue({
  owner,
  repo,
  issueNumber,
  githubInstallationToken,
  numRetries = 1,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
  githubInstallationToken: string;
  numRetries?: number;
}): Promise<GitHubIssueResponse | null> {
  // ... (implementation unchanged)
}

export async function createIssueComment({
  owner,
  repo,
  issueNumber,
  body,
  githubToken,
  numRetries = 1,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  githubToken: string;
  numRetries?: number;
}): Promise<GitHubIssueCommentResponse | null> {
  // ... (implementation unchanged)
}

export async function getBranch({
  owner,
  repo,
  branchName,
  githubInstallationToken,
}: {
  owner: string;
  repo: string;
  branchName: string;
  githubInstallationToken: string;
}): Promise<GitHubBranchResponse | null> {
  // ... (implementation unchanged)
}

// ... (the rest of the functions are unchanged)
