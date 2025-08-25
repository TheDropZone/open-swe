import {
  GitHubBranch,
  GitHubIssue,
  GitHubIssueComment,
  GitHubPullRequest,
  GitHubPullRequestList,
  GitHubPullRequestUpdate,
  GitHubReviewComment,
} from "../github/types";

export interface VCS {
  createPullRequest(options: {
    owner: string;
    repo: string;
    headBranch: string;
    title: string;
    body?: string;
    baseBranch?: string;
    draft?: boolean;
  }): Promise<GitHubPullRequest | GitHubPullRequestList[number] | null>;

  markPullRequestReadyForReview(options: {
    owner: string;
    repo: string;
    pullNumber: number;
    title: string;
    body: string;
  }): Promise<GitHubPullRequestUpdate | null>;

  updatePullRequest(options: {
    owner: string;
    repo: string;
    pullNumber: number;
    title?: string;
    body?: string;
  }): Promise<GitHubPullRequestUpdate | null>;

  getIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
  }): Promise<GitHubIssue | null>;

  getIssueComments(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    filterBotComments: boolean;
  }): Promise<GitHubIssueComment[] | null>;

  createIssue(options: {
    owner: string;
    repo: string;
    title: string;
    body: string;
  }): Promise<GitHubIssue | null>;

  updateIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body?: string;
    title?: string;
  }): Promise<GitHubIssue | null>;

  createIssueComment(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body: string;
  }): Promise<GitHubIssueComment | null>;

  updateIssueComment(options: {
    owner: string;
    repo: string;
    commentId: number;
    body: string;
  }): Promise<GitHubIssueComment | null>;

  getBranch(options: {
    owner: string;
    repo: string;
    branchName: string;
  }): Promise<GitHubBranch | null>;

  replyToReviewComment(options: {
    owner: string;
    repo: string;
    commentId: number;
    body: string;
    pullNumber: number;
  }): Promise<GitHubReviewComment | null>;

  quoteReplyToPullRequestComment(options: {
    owner: string;
    repo: string;
    commentId: number;
    body: string;
    pullNumber: number;
    originalCommentUserLogin: string;
  }): Promise<GitHubIssueComment | null>;

  quoteReplyToReview(options: {
    owner: string;
    repo: string;
    reviewCommentId: number;
    body: string;
    pullNumber: number;
    originalCommentUserLogin: string;
  }): Promise<GitHubIssueComment | null>;
}
