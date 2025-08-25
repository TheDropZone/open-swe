/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PullRequest {
  html_url: string;
  number: number;
}

export interface Issue {
  title: string;
  body: string | null;
}

export interface IssueComment {
  body?: string;
}

export interface Branch {
  name: string;
}

export interface VCS {
  createPullRequest(options: {
    owner: string;
    repo: string;
    headBranch: string;
    title:string;
    body?: string;
    baseBranch?: string;
  }): Promise<PullRequest | null>;

  getIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
  }): Promise<Issue | null>;

  createIssueComment(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body: string;
  }): Promise<IssueComment | null>;

  getBranch(options: {
    owner: string;
    repo: string;
    branchName: string;
  }): Promise<Branch | null>;
}
