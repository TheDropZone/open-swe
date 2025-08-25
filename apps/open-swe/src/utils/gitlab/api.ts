import { getGitlabApiClient } from '@open-swe/shared/gitlab/auth';
import { createLogger, LogLevel } from '../logger';
import {
  GitLabMergeRequest as GitLabMergeRequestResponse,
  GitLabIssue as GitLabIssueResponse,
  GitLabIssueComment as GitLabIssueCommentResponse,
  GitLabBranch as GitLabBranchResponse,
} from './types';
import { VCS, PullRequest, Issue, IssueComment, Branch } from '../vcs/types';

const logger = createLogger(LogLevel.INFO, 'GitLab-API');

export class GitLabVCS implements VCS {
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
  }): Promise<PullRequest | null> {
    try {
      const api = getGitlabApiClient();
      const projectId = this.getProjectId(options.owner, options.repo);
      const mergeRequest = await api.MergeRequests.create(
        projectId,
        options.headBranch,
        options.baseBranch || 'main',
        options.title,
        { description: options.body },
      );
      return {
        html_url: mergeRequest.web_url,
        number: mergeRequest.iid,
      };
    } catch (error) {
      logger.error('Failed to create merge request', { error });
      return null;
    }
  }

  async getIssue(options: {
    owner: string;
    repo: string;
    issueNumber: number;
  }): Promise<Issue | null> {
    try {
      const api = getGitlabApiClient();
      const projectId = this.getProjectId(options.owner, options.repo);
      const issue = await api.Issues.show(projectId, options.issueNumber);
      return {
        title: issue.title,
        body: issue.description,
      };
    } catch (error) {
      logger.error('Failed to get issue', { error });
      return null;
    }
  }

  async createIssueComment(options: {
    owner: string;
    repo: string;
    issueNumber: number;
    body: string;
  }): Promise<IssueComment | null> {
    try {
      const api = getGitlabApiClient();
      const projectId = this.getProjectId(options.owner, options.repo);
      const comment = await api.IssueNotes.create(
        projectId,
        options.issueNumber,
        options.body,
      );
      return {
        body: comment.body,
      };
    } catch (error) {
      logger.error('Failed to create issue comment', { error });
      return null;
    }
  }

  async getBranch(options: {
    owner: string;
    repo: string;
    branchName: string;
  }): Promise<Branch | null> {
    try {
      const api = getGitlabApiClient();
      const projectId = this.getProjectId(options.owner, options.repo);
      const branch = await api.Branches.show(projectId, options.branchName);
      return {
        name: branch.name,
      };
    } catch (error) {
      logger.error('Failed to get branch', { error });
      return null;
    }
  }
}
