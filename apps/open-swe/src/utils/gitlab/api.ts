import { getGitlabApiClient } from '@open-swe/shared/gitlab/auth';
import { createLogger, LogLevel } from '../logger';
import { VCS } from '../vcs/types';
import {
  GitHubBranch,
  GitHubIssue,
  GitHubIssueComment,
  GitHubPullRequest,
  GitHubPullRequestList,
  GitHubPullRequestUpdate,
  GitHubReviewComment,
} from '../github/types';

const logger = createLogger(LogLevel.INFO, 'GitLab-API');

export class GitLabVCS implements VCS {
  private api: ReturnType<typeof getGitlabApiClient>;

  constructor() {
    this.api = getGitlabApiClient();
  }

  private getProjectId(owner: string, repo: string): string {
    return `${owner}/${repo}`;
  }

  async createPullRequest(options: {
    owner: string;
    repo: string;
    headBranch: string;
    title: string;
    body?: string;
    baseBranch?: string;
    draft?: boolean;
  }): Promise<GitHubPullRequest | GitHubPullRequestList[number] | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const mergeRequest = await this.api.MergeRequests.create(
        projectId,
        options.headBranch,
        options.baseBranch || 'main',
        options.title,
        { description: options.body, draft: options.draft },
      );
      return mergeRequest as any;
    } catch (error) {
      logger.error('Failed to create merge request', { error });
      return null;
    }
  }

  async markPullRequestReadyForReview(options: {
    owner: string;
    repo: string;
    pullNumber: number;
    title: string;
    body: string;
  }): Promise<GitHubPullRequestUpdate | null> {
    logger.warn('markPullRequestReadyForReview is not supported in GitLab');
    return null;
  }

  async updatePullRequest(options: {
    owner: string;
    repo: string;
    pullNumber: number;
    title?: string;
    body?: string;
  }): Promise<GitHubPullRequestUpdate | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const mergeRequest = await this.api.MergeRequests.edit(
        projectId,
        options.pullNumber,
        {
          title: options.title,
          description: options.body,
        },
      );
      return mergeRequest as any;
    } catch (error) {
      logger.error('Failed to update merge request', { error });
      return null;
    }
  }

  async getIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
  }): Promise<GitHubIssue | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const issue = await this.api.Issues.show(projectId, options.issueNumber);
      return issue as any;
    } catch (error) {
      logger.error('Failed to get issue', { error });
      return null;
    }
  }

  async getIssueComments(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    filterBotComments: boolean;
  }): Promise<GitHubIssueComment[] | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const comments = await this.api.IssueNotes.all(projectId, options.issueNumber);
      return comments as any;
    } catch (error) {
      logger.error('Failed to get issue comments', { error });
      return null;
    }
  }

  async createIssue(options: {
    owner: string;
    repo: string;
    title: string;
    body: string;
  }): Promise<GitHubIssue | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const issue = await this.api.Issues.create(projectId, {
        title: options.title,
        description: options.body,
      });
      return issue as any;
    } catch (error) {
      logger.error('Failed to create issue', { error });
      return null;
    }
  }

  async updateIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body?: string;
    title?: string;
  }): Promise<GitHubIssue | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const issue = await this.api.Issues.edit(projectId, options.issueNumber, {
        title: options.title,
        description: options.body,
      });
      return issue as any;
    } catch (error) {
      logger.error('Failed to update issue', { error });
      return null;
    }
  }

  async createIssueComment(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body: string;
  }): Promise<GitHubIssueComment | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const comment = await this.api.IssueNotes.create(
        projectId,
        options.issueNumber,
        options.body,
      );
      return comment as any;
    } catch (error) {
      logger.error('Failed to create issue comment', { error });
      return null;
    }
  }

  async updateIssueComment(options: {
    owner: string;
    repo: string;
    commentId: number;
    body: string;
  }): Promise<GitHubIssueComment | null> {
    logger.warn('updateIssueComment is not supported in GitLab');
    return null;
  }

  async getBranch(options: {
    owner: string;
    repo: string;
    branchName: string;
  }): Promise<GitHubBranch | null> {
    try {
      const projectId = this.getProjectId(options.owner, options.repo);
      const branch = await this.api.Branches.show(projectId, options.branchName);
      return branch as any;
    } catch (error) {
      logger.error('Failed to get branch', { error });
      return null;
    }
  }

  async replyToReviewComment(options: {
    owner: string;
    repo: string;
    commentId: number;
    body: string;
    pullNumber: number;
  }): Promise<GitHubReviewComment | null> {
    logger.warn('replyToReviewComment is not supported in GitLab');
    return null;
  }

  async quoteReplyToPullRequestComment(options: {
    owner: string;
    repo: string;
    commentId: number;
    body: string;
    pullNumber: number;
    originalCommentUserLogin: string;
  }): Promise<GitHubIssueComment | null> {
    logger.warn('quoteReplyToPullRequestComment is not supported in GitLab');
    return null;
  }

  async quoteReplyToReview(options: {
    owner: string;
    repo: string;
    reviewCommentId: number;
    body: string;
    pullNumber: number;
    originalCommentUserLogin: string;
  }): Promise<GitHubIssueComment | null> {
    logger.warn('quoteReplyToReview is not supported in GitLab');
    return null;
  }
}
