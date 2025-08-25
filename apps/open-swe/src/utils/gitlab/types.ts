import type {
  MergeRequestSchema,
  IssueSchema,
  BranchSchema,
  NoteSchema,
} from '@gitbeaker/rest';

export type GitLabMergeRequest = MergeRequestSchema;
export type GitLabIssue = IssueSchema;
export type GitLabBranch = BranchSchema;
export type GitLabIssueComment = NoteSchema;
