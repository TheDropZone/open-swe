import { Gitlab } from '@gitbeaker/rest';

export function getGitlabApiClient() {
  const host = process.env.GITLAB_API_URL;
  const token = process.env.GITLAB_PRIVATE_TOKEN;

  if (!host || !token) {
    throw new Error('GitLab API URL or private token not found in environment variables.');
  }

  return new Gitlab({
    host,
    token,
  });
}
