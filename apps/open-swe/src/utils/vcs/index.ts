import { VCS } from './types';
import { GitHubVCS } from '../github/api';
import { GitLabVCS } from '../gitlab/api';
import { getConfig } from '@langchain/langgraph';
import { GITHUB_INSTALLATION_ID } from '@open-swe/shared/constants';

export function getVCS(): VCS {
  const config = getConfig();
  const githubInstallationToken = config.configurable?.[GITHUB_INSTALLATION_ID];
  const gitlabApiUrl = process.env.GITLAB_API_URL;

  if (githubInstallationToken) {
    return new GitHubVCS(githubInstallationToken);
  }

  if (gitlabApiUrl) {
    return new GitLabVCS();
  }

  throw new Error('No version control system configured.');
}
