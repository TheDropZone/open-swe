import { VCS } from './types';
import { GitHubVCS } from '../github/api';
import { GitLabVCS } from '../gitlab/api';
import { getConfig } from '@langchain/langgraph';
import { GITHUB_INSTALLATION_ID, GITHUB_ACCESS_TOKEN } from '@open-swe/shared/constants';

export function getVCS(): VCS {
  const config = getConfig();
  const githubInstallationToken = config.configurable?.[GITHUB_INSTALLATION_ID];
  const githubAccessToken = config.configurable?.[GITHUB_ACCESS_TOKEN];
  const gitlabApiUrl = process.env.GITLAB_API_URL;

  if (githubInstallationToken) {
    return new GitHubVCS(githubInstallationToken, githubAccessToken);
  }

  if (gitlabApiUrl) {
    return new GitLabVCS();
  }

  throw new Error('No version control system configured.');
}
