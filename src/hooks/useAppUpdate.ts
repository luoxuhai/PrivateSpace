import axios from 'axios';
import { useQuery } from 'react-query';

import config from '@/config';
import { applicationInfo, compareVersion } from '@/utils';

function useAppUpdate() {
  const { data } = useQuery(
    'app.update',
    async () => {
      const res = await axios.get(
        `https://itunes.apple.com/cn/lookup?id=${config.appId}`,
      );

      const localVersion = applicationInfo.version;

      if (!res?.data?.results?.[0]) {
        return {
          localVersion,
          latestVersion: localVersion,
          existNewVersion: false,
        };
      }

      const { version: latestVersion, releaseNotes } = res.data.results[0];
      const existNewVersion =
        compareVersion(latestVersion, localVersion ?? '') === 1;

      return {
        localVersion,
        latestVersion,
        releaseNotes,
        existNewVersion,
      };
    },
    { enabled: true },
  );

  return data;
}

export default useAppUpdate;
