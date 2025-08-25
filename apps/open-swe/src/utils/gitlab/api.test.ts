import { jest } from '@jest/globals';

const mockCreateMergeRequest = jest.fn();
const mockShowIssue = jest.fn();
const mockCreateIssueNote = jest.fn();
const mockShowBranch = jest.fn();

jest.unstable_mockModule('@gitbeaker/rest', () => ({
  Gitlab: jest.fn().mockImplementation(() => ({
    MergeRequests: {
      create: mockCreateMergeRequest,
    },
    Issues: {
      show: mockShowIssue,
    },
    IssueNotes: {
      create: mockCreateIssueNote,
    },
    Branches: {
      show: mockShowBranch,
    },
  })),
}));

describe('GitLabVCS', () => {
  let vcs: any;
  let GitLabVCS: any;

  beforeAll(async () => {
    const { GitLabVCS: VCS } = await import('./api');
    GitLabVCS = VCS;
  });

  beforeEach(async () => {
    vcs = new GitLabVCS();
    process.env.GITLAB_API_URL = 'https://gitlab.com';
    process.env.GITLAB_PRIVATE_TOKEN = 'test-token';
    mockCreateMergeRequest.mockClear();
    mockShowIssue.mockClear();
    mockCreateIssueNote.mockClear();
    mockShowBranch.mockClear();
  });

  it('should create a merge request', async () => {
    mockCreateMergeRequest.mockResolvedValue({ web_url: 'http://example.com/mr/1', iid: 1 });
    const pr = await vcs.createPullRequest({
      owner: 'test-owner',
      repo: 'test-repo',
      headBranch: 'feature-branch',
      title: 'Test MR',
      baseBranch: 'main',
    });
    expect(mockCreateMergeRequest).toHaveBeenCalledWith(
      'test-owner/test-repo',
      'feature-branch',
      'main',
      'Test MR',
      { description: undefined },
    );
    expect(pr).toEqual({ html_url: 'http://example.com/mr/1', number: 1 });
  });

  it('should get an issue', async () => {
    mockShowIssue.mockResolvedValue({ title: 'Test Issue', description: 'Test Description' });
    const issue = await vcs.getIssue({
      owner: 'test-owner',
      repo: 'test-repo',
      issueNumber: 123,
    });
    expect(mockShowIssue).toHaveBeenCalledWith('test-owner/test-repo', 123);
    expect(issue).toEqual({ title: 'Test Issue', body: 'Test Description' });
  });

  it('should create an issue comment', async () => {
    mockCreateIssueNote.mockResolvedValue({ body: 'Test Comment' });
    const comment = await vcs.createIssueComment({
      owner: 'test-owner',
      repo: 'test-repo',
      issueNumber: 123,
      body: 'Test Comment',
    });
    expect(mockCreateIssueNote).toHaveBeenCalledWith('test-owner/test-repo', 123, 'Test Comment');
    expect(comment).toEqual({ body: 'Test Comment' });
  });

  it('should get a branch', async () => {
    mockShowBranch.mockResolvedValue({ name: 'main' });
    const branch = await vcs.getBranch({
      owner: 'test-owner',
      repo: 'test-repo',
      branchName: 'main',
    });
    expect(mockShowBranch).toHaveBeenCalledWith('test-owner/test-repo', 'main');
    expect(branch).toEqual({ name: 'main' });
  });
});
