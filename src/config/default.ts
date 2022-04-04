export default {
  // 腾讯兔小巢反馈链接
  TXC_FEEDBACK_URL: 'https://support.qq.com/product/334350',

  /** 更新日志 */
  CHANGELOG: {
    zh_cn:
      'https://privatespace-4gagcjdu022008e0-1258504012.tcloudbaseapp.com/zh-cn/changelog.html',
    en_us: 'https://private-space-web.netlify.app/en-us/changelog',
  },

  /** 用户协议 */
  USER_AGREEMENT: {
    zh_cn:
      'https://privatespace-4gagcjdu022008e0-1258504012.tcloudbaseapp.com/zh-cn/user-agreement.html',
    en_us: 'https://private-space-web.netlify.app/en-us/user-agreement',
  },

  /** 应用商店链接 */
  APP_URL: {
    cn: `https://apps.apple.com/cn/app/${encodeURI(
      '隐私空间-隐藏私人图片视频',
    )}/id1597534147`,
    global: 'https://apps.apple.com/app/id1597534147',
  },

  /** 隐私政策 */
  PRIVACY_POLICY_URL: {
    zh_cn:
      'https://privatespace-4gagcjdu022008e0-1258504012.tcloudbaseapp.com/zh-cn/privacy-policy.html',
    en_us: 'https://private-space-web.netlify.app/en-us/privacy-policy',
  },

  defaultAlbum: [
    {
      name: '默认相册',
    },
  ],

  appId: '1597534147',
  developerId: '1572453992',
  enableDebugModeKey: 'a1a9ac8f80b62',
  email: 'darkce97@gmail.com',
  qqGroup: '168380697',
  fundebugApiKey:
    '740fabe1c51a8ef0cf52195956a707e05c24d471da5d33703d69513d40f36990',
  inAppPurchasesProductIds: [
    'net.darkce.privatespace_1.0',
    'net.darkce.privatespace_2',
  ],
  sentry: {
    dsn: 'https://d04bc938d0934611b16c70c75a8f20d5@o264285.ingest.sentry.io/6139676',
    tracesSampleRate: 0.5,
  },
};
