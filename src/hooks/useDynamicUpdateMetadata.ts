import { useQuery } from 'react-query';
import CodePush from 'react-native-code-push';

function downloadPackage() {
  return new Promise(resolve => {
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: CodePush.InstallMode.ON_NEXT_SUSPEND,
        minimumBackgroundDuration: 60 * 1,
      },
      undefined,
      progress => {
        if (progress.receivedBytes === progress.totalBytes) {
          resolve(true);
        }
      },
    );
  });
}

function useDynamicUpdateMetadata(state = CodePush.UpdateState.RUNNING) {
  const { data, refetch } = useQuery(
    ['dynamic.update.metadata.', state],
    async () => {
      if (state === CodePush.UpdateState.PENDING) {
        try {
          await downloadPackage();
        } catch {}
      }
      return await CodePush.getUpdateMetadata(state);
    },
    { enabled: true },
  );

  return {
    data: data && {
      ...data,
      labelWithoutPrefix: data?.label?.replace('v', '') ?? 0,
    },
    refetch,
  };
}

export default useDynamicUpdateMetadata;
